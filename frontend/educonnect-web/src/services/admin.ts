import { getAdminMetrics as getAdminMetricsMock, type AdminMetrics } from "@/mocks/metrics";

export function getAdminMetrics(): AdminMetrics {
  return getAdminMetricsMock();
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  return getAdminMetricsMock();
}
