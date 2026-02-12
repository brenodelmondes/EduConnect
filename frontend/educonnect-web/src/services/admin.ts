import { getAdminMetrics as getAdminMetricsMock, type AdminMetrics } from "@/mocks/metrics";

/**
 * Camada de service para desacoplar a UI da origem de dados.
 * Hoje usa mocks; na próxima etapa troca para API sem refatorar o dashboard.
 */
export function getAdminMetrics(): AdminMetrics {
  return getAdminMetricsMock();
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  return getAdminMetricsMock();
}
