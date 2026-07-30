import { Module } from '@nestjs/common';
import {
  getToken,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { HttpMetricsMiddleware } from './http-metrics.middleware';
import {
  HTTP_ERRORS_TOTAL,
  HTTP_REQUEST_DURATION_SECONDS,
  PAIEMENTS_TOTAL,
  RESERVATIONS_TOTAL,
} from './metrics.constants';

@Module({
  providers: [
    makeCounterProvider({
      name: RESERVATIONS_TOTAL,
      help: 'Nombre total de réservations créées',
    }),
    makeCounterProvider({
      name: PAIEMENTS_TOTAL,
      help: 'Nombre total de paiements par statut',
      labelNames: ['statut'],
    }),
    makeHistogramProvider({
      name: HTTP_REQUEST_DURATION_SECONDS,
      help: 'Durée des requêtes HTTP en secondes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
    }),
    makeCounterProvider({
      name: HTTP_ERRORS_TOTAL,
      help: "Nombre total d'erreurs HTTP par code de statut",
      labelNames: ['status_code'],
    }),
    HttpMetricsMiddleware,
  ],
  exports: [
    getToken(RESERVATIONS_TOTAL),
    getToken(PAIEMENTS_TOTAL),
    getToken(HTTP_REQUEST_DURATION_SECONDS),
    getToken(HTTP_ERRORS_TOTAL),
    HttpMetricsMiddleware,
  ],
})
export class MetricsModule {}
