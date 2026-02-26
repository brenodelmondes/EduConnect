import { DEMO_MODE } from "@/config/env";
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

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function newId(prefix: string) {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") return `${prefix}_${randomUUID.call(globalThis.crypto)}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

async function tryApiUpload(file: File, context: UploadContext): Promise<UploadedFile | null> {
  if (DEMO_MODE) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", context.purpose);
  formData.append("role", context.role);
  if (typeof context.userId === "number") formData.append("userId", String(context.userId));
  if (context.courseId) formData.append("courseId", context.courseId);
  if (context.activityId) formData.append("activityId", context.activityId);

  const endpoints = ["/Files/upload", "/files/upload", "/Uploads", "/upload"];
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const payload = response.data as
        | {
            id?: string | number;
            fileId?: string | number;
            name?: string;
            fileName?: string;
            url?: string;
            path?: string;
            Id?: string | number;
            FileId?: string | number;
            Name?: string;
            FileName?: string;
            Url?: string;
            Path?: string;
          }
        | undefined;

      const fileId = payload?.fileId ?? payload?.FileId ?? payload?.id ?? payload?.Id;
      const fileName = payload?.fileName ?? payload?.FileName ?? payload?.name ?? payload?.Name ?? file.name;
      const url = payload?.url ?? payload?.Url ?? payload?.path ?? payload?.Path;

      if (fileId) {
        return {
          fileId: String(fileId),
          fileName: String(fileName),
          url: url ? String(url) : undefined,
          source: "API",
        };
      }
    } catch {
      // Try next endpoint.
    }
  }

  return null;
}

export const filesRepository = {
  async upload(file: File, context: UploadContext): Promise<UploadedFile> {
    const apiUpload = await tryApiUpload(file, context);
    if (apiUpload) return apiUpload;

    const fileId = newId("local_file");
    const url = canUseStorage() ? URL.createObjectURL(file) : undefined;
    return {
      fileId,
      fileName: file.name,
      url,
      source: "LOCAL",
    };
  },
};

