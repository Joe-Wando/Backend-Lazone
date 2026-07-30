import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { NextFunction, Request, Response } from 'express';
import { HTTP_ERRORS_TOTAL, HTTP_REQUEST_DURATION_SECONDS } from './metrics.constants';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric(HTTP_REQUEST_DURATION_SECONDS)
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric(HTTP_ERRORS_TOTAL)
    private readonly httpErrorsTotal: Counter<string>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const arreterChrono = this.httpRequestDuration.startTimer();

    res.on('finish', () => {
      // Pattern de route (ex: /reservations/:id), pas l'URL brute, pour éviter
      // qu'un UUID différent à chaque requête crée une nouvelle série Prometheus.
      const route = req.route?.path ?? 'non_trouvee';
      const statusCode = String(res.statusCode);

      arreterChrono({ method: req.method, route, status_code: statusCode });

      if (res.statusCode >= 400) {
        this.httpErrorsTotal.inc({ status_code: statusCode });
      }
    });

    next();
  }
}
