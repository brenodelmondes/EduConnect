import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/app/auth";
import {
  portalService,
  type StudentAnnouncement,
  type StudentCourseCard,
  type StudentGradeRow,
  type StudentNotification,
} from "@/services/portal";

type StudentPortalState = {
  courses: StudentCourseCard[];
  announcements: StudentAnnouncement[];
  notifications: StudentNotification[];
  grades: StudentGradeRow[];
  upcoming: Awaited<ReturnType<typeof portalService.listUpcomingEvents>>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const StudentPortalContext = createContext<StudentPortalState | null>(null);

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function StudentPortalProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const mounted = useRef(true);

  const [courses, setCourses] = useState<StudentCourseCard[]>([]);
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [grades, setGrades] = useState<StudentGradeRow[]>([]);
  const [upcoming, setUpcoming] = useState<Awaited<ReturnType<typeof portalService.listUpcomingEvents>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(300);
      const [courseRows, announcementRows, notificationRows, upcomingRows] = await Promise.all([
        portalService.listCourses(userId),
        portalService.listAnnouncements(),
        portalService.listNotifications(),
        portalService.listUpcomingEvents({ role: "ALUNO", userId, limit: 6 }),
      ]);
      const gradeRows = await portalService.listGrades(courseRows);

      if (mounted.current) {
        setCourses(courseRows);
        setAnnouncements(announcementRows);
        setNotifications(notificationRows);
        setGrades(gradeRows);
        setUpcoming(upcomingRows);
      }
    } catch {
      if (mounted.current) {
        setError("Não foi possível carregar informações do portal.");
        setCourses([]);
        setAnnouncements([]);
        setNotifications([]);
        setGrades([]);
        setUpcoming([]);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    void reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  const value = useMemo<StudentPortalState>(
    () => ({
      courses,
      announcements,
      notifications,
      grades,
      upcoming,
      loading,
      error,
      reload,
    }),
    [courses, announcements, notifications, grades, upcoming, loading, error, reload]
  );

  return <StudentPortalContext.Provider value={value}>{children}</StudentPortalContext.Provider>;
}

export function useStudentPortal() {
  const context = useContext(StudentPortalContext);
  if (!context) {
    throw new Error("useStudentPortal must be used within StudentPortalProvider");
  }
  return context;
}
