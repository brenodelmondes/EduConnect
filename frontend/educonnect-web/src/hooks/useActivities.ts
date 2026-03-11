import { useCallback, useEffect, useMemo, useState } from "react";

import { activitiesRepository } from "@/services/activities.repository";
import { filesRepository, type UploadedFile } from "@/services/files.repository";
import type { ActivityRow, MaterialRow, SubmissionRow } from "@/types/academic";
import type { UserRole } from "@/utils/storage";

type CourseRow = {
  id: string;
  title: string;
  track: "ADS" | "SI" | "CCO" | "ENG";
  semesterLabel: string;
  teacherName: string;
};

type UseActivitiesParams = {
  role: UserRole;
  userId?: number | null;
};

export function useActivities({ role, userId }: UseActivitiesParams) {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const snapshot = await activitiesRepository.listByRole(role, userId);
      setCourses(snapshot.courses);
      setMaterials(snapshot.materials);
      setActivities(snapshot.activities);
      setSubmissions(snapshot.submissions);
    } catch {
      setError("Não foi possível carregar materiais e atividades.");
      setCourses([]);
      setMaterials([]);
      setActivities([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createByProfessor = useCallback(
    async (input: {
      courseId: string;
      title: string;
      description: string;
      dueAt: string;
      attachmentFile?: File | null;
    }) => {
      let uploaded: UploadedFile | null = null;

      if (input.attachmentFile) {
        uploaded = await filesRepository.upload(input.attachmentFile, {
          role: "PROFESSOR",
          userId,
          purpose: "ATIVIDADE",
          courseId: input.courseId,
        });
      }

      const next = await activitiesRepository.createByProfessor(
        {
          courseId: input.courseId,
          title: input.title,
          description: input.description,
          dueAt: input.dueAt,
          attachmentName: uploaded?.fileName,
          attachmentFileId: uploaded?.fileId,
          attachmentUrl: uploaded?.url,
        },
        userId
      );
      setActivities((prev) => [next, ...prev]);
      return { ...next, uploadSource: uploaded?.source };
    },
    [userId]
  );

  const submitByStudent = useCallback(
    async (activityId: string, file: File) => {
      const uploaded = await filesRepository.upload(file, {
        role: "ALUNO",
        userId,
        purpose: "SUBMISSAO",
        activityId,
      });

      const submission = await activitiesRepository.submitByStudent(
        activityId,
        {
          fileName: uploaded.fileName,
          submissionFileId: uploaded.fileId,
          submissionUrl: uploaded.url,
        },
        userId
      );
      setSubmissions((prev) => [submission, ...prev.filter((item) => item.activityId !== activityId)]);
      return { ...submission, uploadSource: uploaded.source };
    },
    [userId]
  );

  const submissionsMap = useMemo(() => {
    const map = new Map<string, SubmissionRow>();
    for (const submission of submissions) map.set(submission.activityId, submission);
    return map;
  }, [submissions]);

  return {
    courses,
    materials,
    activities,
    submissions,
    submissionsMap,
    loading,
    error,
    load,
    createByProfessor,
    submitByStudent,
  };
}
