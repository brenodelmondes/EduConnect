import { API_URL, STRICT_API, USE_DEMO_FALLBACK } from "@/config/env";
import { api } from "@/services/api";

type UploadContext = {
  role: "ADMIN" | "PROFESSOR" | "ALUNO";
  userId?: number | null;
  purpose: "MATERIAL" | "ATIVIDADE" | "SUBMISSAO";
  courseId?: string;
  activityId?: string;
};

export type UploadedFile = {
  fileId: string;
  fileName: string;
  url?: string;
  source: "API" | "LOCAL";
};

function newId(prefix: string) {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") return `${prefix}_${randomUUID.call(globalThis.crypto)}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

async function uploadToApi(file: File, context: UploadContext): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", context.purpose);
  formData.append("role", context.role);
  if (typeof context.userId === "number") formData.append("userId", String(context.userId));
  if (context.courseId) formData.append("courseId", context.courseId);
  if (context.activityId) formData.append("activityId", context.activityId);

  const response = await api.post<{
    fileId?: string | number;
    fileName?: string;
    url?: string;
    FileId?: string | number;
    FileName?: string;
    Url?: string;
  }>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const payload = response.data;
  const fileId = payload?.fileId ?? payload?.FileId;
  const fileName = payload?.fileName ?? payload?.FileName;
  const url = payload?.url ?? payload?.Url;

  if (!fileId || !fileName) {
    throw new Error("Resposta inválida no upload. Esperado { fileId, fileName, url }");
  }

  return {
    fileId: String(fileId),
    fileName: String(fileName),
    url: url ? String(url) : undefined,
    source: "API",
  };
}

export const filesRepository = {
  async upload(file: File, context: UploadContext): Promise<UploadedFile> {
    if (!USE_DEMO_FALLBACK && !API_URL) {
      throw new Error("API_URL não configurada para upload");
    }

    if (!USE_DEMO_FALLBACK || API_URL) {
      try {
        return await uploadToApi(file, context);
      } catch (error) {
        if (STRICT_API) throw error;
      }
    }

    const fileId = newId("local_file");
    const url = URL.createObjectURL(file);
    return {
      fileId,
      fileName: file.name,
      url,
      source: "LOCAL",
    };
  },
};

