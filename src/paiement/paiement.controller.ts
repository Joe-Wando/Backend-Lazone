import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
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
  private readonly logger = new Logger(PaiementController.name);

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
    const payload = request.body as WebhookNabooPay;
    this.logger.log(
      `Webhook reçu : order_id=${payload?.order_id} transaction_status=${payload?.transaction_status} signature_presente=${!!signature}`,
    );

    const signatureOk = this.signatureValide(request.rawBody, signature);
    this.logger.log(`Vérification de signature : ${signatureOk ? 'OK' : 'ÉCHEC'}`);

    if (!signatureOk) {
      throw new UnauthorizedException('Signature invalide');
    }

    // La doc publique NabooPay annonce "completed", mais la valeur réellement
    // envoyée pour un paiement réussi est "paid" (constaté en production, cf.
    // logs du 26/07/2026).
    if (payload.transaction_status === 'paid') {
      this.logger.log(
        `transaction_status=paid, confirmation de la réservation pour order_id=${payload.order_id}`,
      );
      await this.paiementService.confirmerParOrderId(payload.order_id);
    } else {
      this.logger.log(
        `transaction_status=${payload.transaction_status} ignoré (pas "paid") pour order_id=${payload.order_id}`,
      );
    }

    return { received: true };
  }

  private signatureValide(rawBody: Buffer | undefined, signature: string): boolean {
    if (!rawBody || !signature) {
      this.logger.warn(
        `Signature non vérifiable : rawBody_present=${!!rawBody} signature_present=${!!signature}`,
      );
      return false;
    }
    const secret = this.configService.get('NABOOPAY_WEBHOOK_SECRET');
    this.logger.log(`Secret webhook configuré : ${secret ? 'oui (longueur ' + secret.length + ')' : 'NON (vide)'}`);

    const signatureAttendue = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const bufferAttendu = Buffer.from(signatureAttendue, 'hex');
    const bufferRecu = Buffer.from(signature, 'hex');
    if (bufferAttendu.length !== bufferRecu.length) {
      this.logger.warn(
        `Longueur de signature différente : attendue=${bufferAttendu.length} reçue=${bufferRecu.length}`,
      );
      return false;
    }
    return timingSafeEqual(bufferAttendu, bufferRecu);
  }
}
