import { API_URL, STRICT_API } from "@/config/env";
import { api } from "@/services/api";

export type EnrollmentCourse = "ADS" | "SI" | "CCO" | "ENG";

export type EnrollmentInput = {
  fullName: string;
  email: string;
  phone: string;
  course: EnrollmentCourse;
  emailTemplate?: string;
};

export type EnrollmentResult = {
  status: string;
  correlationId: string;
};

const localState = new Map<string, EnrollmentResult>();

function newCorrelationId() {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto).replaceAll("-", "");
  }
  return `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function mapResult(input: {
  status?: string;
  correlationId?: string;
  Status?: string;
  CorrelationId?: string;
}): EnrollmentResult {
  const status = input.status ?? input.Status;
  const correlationId = input.correlationId ?? input.CorrelationId;

  if (!status || !correlationId) {
    throw new Error("Resposta de inscrição inválida. Esperado { status, correlationId }.");
  }

  return { status: String(status), correlationId: String(correlationId) };
}

export const inscricaoService = {
  async submit(input: EnrollmentInput): Promise<EnrollmentResult> {
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para inscrição em modo estrito");
      }

      const localResult: EnrollmentResult = {
        status: "RECEBIDA",
        correlationId: newCorrelationId(),
      };
      localState.set(localResult.correlationId, localResult);
      return localResult;
    }

    const response = await api.post("/inscricoes", {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      course: input.course,
      emailTemplate: input.emailTemplate ?? "DEFAULT",
    });

    return mapResult(response.data ?? {});
  },

  async getStatus(correlationId: string): Promise<EnrollmentResult> {
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para consulta de inscrição em modo estrito");
      }

      const stored = localState.get(correlationId);
      if (!stored) {
        throw new Error("Inscrição não encontrada.");
      }
      return stored;
    }

    const response = await api.get(`/inscricoes/${encodeURIComponent(correlationId)}/status`);
    return mapResult(response.data ?? {});
  },

  async resendEmail(correlationId: string): Promise<EnrollmentResult> {
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para reenvio de e-mail em modo estrito");
      }

      const stored = localState.get(correlationId);
      if (!stored) {
        throw new Error("Inscrição não encontrada.");
      }

      const updated: EnrollmentResult = {
        status: "EMAIL_REENVIADO",
        correlationId,
      };
      localState.set(correlationId, updated);
      return updated;
    }

    const response = await api.post(`/inscricoes/${encodeURIComponent(correlationId)}/reenviar-email`);
    return mapResult(response.data ?? {});
  },
};
