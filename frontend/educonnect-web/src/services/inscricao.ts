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
  firstAccessReleased?: boolean;
  emailSent?: boolean;
  temporaryLogin?: string;
  temporaryPassword?: string;
  message?: string;
};

export type InscricaoPendente = {
  correlationId: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  turmaCodigo?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  emailSent?: boolean;
  message?: string | null;
};

type ApiInscricao = {
  status?: string;
  correlationId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  course?: string;
  turmaCodigo?: string | null;
  createdAt?: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  emailSent?: boolean;
  message?: string | null;

  Status?: string;
  CorrelationId?: string;
  FullName?: string;
  Email?: string;
  Phone?: string;
  Course?: string;
  TurmaCodigo?: string | null;
  CreatedAt?: string;
  ReviewedAt?: string | null;
  ReviewedBy?: string | null;
  EmailSent?: boolean;
  Message?: string | null;
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
  firstAccessReleased?: boolean;
  emailSent?: boolean;
  temporaryLogin?: string;
  temporaryPassword?: string;
  message?: string;
  Status?: string;
  CorrelationId?: string;
  FirstAccessReleased?: boolean;
  EmailSent?: boolean;
  TemporaryLogin?: string;
  TemporaryPassword?: string;
  Message?: string;
}): EnrollmentResult {
  const status = input.status ?? input.Status;
  const correlationId = input.correlationId ?? input.CorrelationId;

  if (!status || !correlationId) {
    throw new Error("Resposta de inscrição inválida. Esperado { status, correlationId }.");
  }

  return {
    status: String(status),
    correlationId: String(correlationId),
    firstAccessReleased: input.firstAccessReleased ?? input.FirstAccessReleased,
    emailSent: input.emailSent ?? input.EmailSent,
    temporaryLogin: input.temporaryLogin ?? input.TemporaryLogin,
    temporaryPassword: input.temporaryPassword ?? input.TemporaryPassword,
    message: input.message ?? input.Message,
  };
}

function mapInscricao(input: ApiInscricao, index: number): InscricaoPendente {
  const status = input.status ?? input.Status ?? "PENDENTE";
  const correlationId = input.correlationId ?? input.CorrelationId ?? `inscricao_${index}`;
  const createdAt = input.createdAt ?? input.CreatedAt ?? new Date().toISOString();

  return {
    status: String(status),
    correlationId: String(correlationId),
    fullName: String(input.fullName ?? input.FullName ?? ""),
    email: String(input.email ?? input.Email ?? ""),
    phone: String(input.phone ?? input.Phone ?? ""),
    course: String(input.course ?? input.Course ?? ""),
    turmaCodigo: input.turmaCodigo ?? input.TurmaCodigo ?? null,
    createdAt: String(createdAt),
    reviewedAt: input.reviewedAt ?? input.ReviewedAt ?? null,
    reviewedBy: input.reviewedBy ?? input.ReviewedBy ?? null,
    emailSent: input.emailSent ?? input.EmailSent,
    message: input.message ?? input.Message ?? null,
  };
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
        firstAccessReleased: false,
        emailSent: false,
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

  async confirmPayment(correlationId: string): Promise<EnrollmentResult> {
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para confirmação de pagamento em modo estrito");
      }

      const stored = localState.get(correlationId);
      if (!stored) {
        throw new Error("Inscrição não encontrada.");
      }

      const updated: EnrollmentResult = {
        ...stored,
        status: "PAGO",
        firstAccessReleased: true,
        emailSent: true,
        temporaryLogin: "aluno.demo@educonnect.local",
        temporaryPassword: "Edu@DEMO01",
        message: "Credenciais provisórias enviadas (simulação local).",
      };
      localState.set(correlationId, updated);
      return updated;
    }

    const response = await api.post(`/inscricoes/${encodeURIComponent(correlationId)}/realizar-pagamento`);
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
        ...stored,
        status: "EMAIL_REENVIADO",
        correlationId,
        emailSent: true,
        message: "Credenciais reenviadas (simulação local).",
      };
      localState.set(correlationId, updated);
      return updated;
    }

    const response = await api.post(`/inscricoes/${encodeURIComponent(correlationId)}/reenviar-email`);
    return mapResult(response.data ?? {});
  },

  async listPendentes(): Promise<InscricaoPendente[]> {
    if (!API_URL) {
      throw new Error("API_URL não configurada para listar inscrições pendentes");
    }

    const response = await api.get<ApiInscricao[]>("/inscricoes/pendentes");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapInscricao);
  },

  async listProcessadas(status?: string): Promise<InscricaoPendente[]> {
    if (!API_URL) {
      throw new Error("API_URL não configurada para listar inscrições processadas");
    }

    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get<ApiInscricao[]>(`/inscricoes/processadas${query}`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapInscricao);
  },

  async aprovar(correlationId: string, turmaCodigo?: string): Promise<EnrollmentResult> {
    if (!API_URL) {
      throw new Error("API_URL não configurada para aprovar inscrições");
    }

    const payload = turmaCodigo?.trim() ? { turmaCodigo: turmaCodigo.trim() } : {};
    const response = await api.post(
      `/inscricoes/${encodeURIComponent(correlationId)}/aprovar`,
      payload
    );
    return mapResult(response.data ?? {});
  },
};
