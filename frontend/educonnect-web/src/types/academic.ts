import { type UserRole } from "@/utils/storage";

export type CalendarActor = "ADMIN" | "PROFESSOR" | "ALUNO" | "API";
export type CalendarScope = "INSTITUCIONAL" | "DOCENTE" | "PESSOAL";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  createdByRole: CalendarActor;
  scope: CalendarScope;
};

export type MaterialRow = {
  id: string;
  courseId: string;
  title: string;
  fileName: string;
  fileId?: string;
  fileUrl?: string;
  createdAt: string;
};

export type ActivityRow = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueAt: string;
  createdAt: string;
  createdByRole: Extract<UserRole, "PROFESSOR" | "ADMIN">;
  attachmentName?: string;
  attachmentFileId?: string;
  attachmentUrl?: string;
};

export type SubmissionStatus = "ENTREGUE" | "ATRASADO";

export type SubmissionRow = {
  id: string;
  activityId: string;
  studentUserId: number;
  fileName: string;
  submissionFileId?: string;
  submissionUrl?: string;
  submittedAt: string;
  status: SubmissionStatus;
};
