import { classes, enrollments, students, teachers } from "@/mocks/db";

export type AdminMetrics = {
  studentsTotal: number;
  teachersTotal: number;
  activeClasses: number;

  newEnrollmentsSemester: number;
  dropoutRateSemester: number; // 0.034 => 3.4%
  delinquencyRate: number; // 0.052 => 5.2%

  pendingEnrollments: number;
  docsToValidate: number;
  classesWithoutTeacher: number;

  distribution: { name: string; value: number }[];
};

function parseIsoDate(date: string) {
  // normaliza para evitar variações de timezone
  return new Date(`${date}T00:00:00`);
}

function isInCurrentSemester(isoDate: string, now = new Date()) {
  const d = parseIsoDate(isoDate);
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  const semesterStartMonth = month < 6 ? 0 : 6;
  const semesterEndMonth = month < 6 ? 5 : 11;

  const start = new Date(year, semesterStartMonth, 1);
  const end = new Date(year, semesterEndMonth + 1, 1);
  return d >= start && d < end;
}

export function getAdminMetrics(): AdminMetrics {
  const activeTeachers = teachers.filter((t) => t.active);
  const activeClasses = classes.filter((c) => c.active);

  const pendingEnrollments = enrollments.filter((e) => e.status === "PENDENTE").length;
  const classesWithoutTeacher = activeClasses.filter((c) => !c.teacherId).length;

  const semesterEnrollments = enrollments.filter((e) => isInCurrentSemester(e.createdAt));
  const newEnrollmentsSemester = semesterEnrollments.length;

  const semesterNewStudents = students.filter((s) => isInCurrentSemester(s.enrolledAt));
  const dropoutRateSemester = semesterNewStudents.length
    ? semesterNewStudents.filter((s) => !s.active).length / semesterNewStudents.length
    : 0;

  // MVP: não há mock financeiro; mantém estimativa estável para a apresentação.
  const delinquencyRate = 0.052;

  const courseOrder = ["ADS", "Eng. Software", "Ciência da Computação", "SI"];
  const byCourse = new Map<string, number>();
  for (const s of students) {
    byCourse.set(s.course, (byCourse.get(s.course) ?? 0) + 1);
  }

  const distribution = courseOrder
    .map((name) => ({ name, value: byCourse.get(name) ?? 0 }))
    .filter((d) => d.value > 0);

  return {
    studentsTotal: students.length,
    teachersTotal: activeTeachers.length,
    activeClasses: activeClasses.length,

    newEnrollmentsSemester,
    dropoutRateSemester,
    delinquencyRate,

    pendingEnrollments,
    docsToValidate: 7,
    classesWithoutTeacher,

    distribution,
  };
}
