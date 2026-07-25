import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { PaiementService } from './paiement.service';

interface WebhookNabooPay {
  order_id: string;
  transaction_status: string;
}

@Controller('paiement')
export class PaiementController {
  constructor(
    private readonly paiementService: PaiementService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    if (!this.signatureValide(request.rawBody, signature)) {
      throw new UnauthorizedException('Signature invalide');
    }

    const payload = request.body as WebhookNabooPay;
    if (payload.transaction_status === 'completed') {
      await this.paiementService.confirmerParOrderId(payload.order_id);
    }

    return { received: true };
  }

  private signatureValide(rawBody: Buffer | undefined, signature: string): boolean {
    if (!rawBody || !signature) {
      return false;
    }
    const secret = this.configService.get('NABOOPAY_WEBHOOK_SECRET');
    const signatureAttendue = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const bufferAttendu = Buffer.from(signatureAttendue, 'hex');
    const bufferRecu = Buffer.from(signature, 'hex');
    if (bufferAttendu.length !== bufferRecu.length) {
      return false;
    }
    return timingSafeEqual(bufferAttendu, bufferRecu);
  }
}
