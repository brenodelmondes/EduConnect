import { classes, enrollments, students, teachers } from "@/mocks/db";

export type AdminMetrics = {
  studentsTotal: number;
  teachersTotal: number;
  activeClasses: number;

  newEnrollmentsSemester: number;
  dropoutRateSemester: number;
  delinquencyRate: number;

  pendingEnrollments: number;
  docsToValidate: number;
  classesWithoutTeacher: number;

  distribution: { name: string; value: number }[];
};

function parseIsoDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`);
}

function isInCurrentSemester(isoDate: string, now = new Date()) {
  const date = parseIsoDate(isoDate);
  const year = now.getFullYear();
  const month = now.getMonth();

  const semesterStartMonth = month < 6 ? 0 : 6;
  const semesterEndMonth = month < 6 ? 5 : 11;

  const start = new Date(year, semesterStartMonth, 1);
  const end = new Date(year, semesterEndMonth + 1, 1);
  return date >= start && date < end;
}

export function getAdminMetrics(): AdminMetrics {
  const activeTeachers = teachers.filter((item) => item.active);
  const activeClasses = classes.filter((item) => item.active);

  const pendingEnrollments = enrollments.filter((item) => item.status === "PENDENTE").length;
  const classesWithoutTeacher = activeClasses.filter((item) => !item.teacherId).length;

  const semesterEnrollments = enrollments.filter((item) => isInCurrentSemester(item.createdAt));
  const newEnrollmentsSemester = semesterEnrollments.length;

  const semesterNewStudents = students.filter((item) => isInCurrentSemester(item.enrolledAt));
  const dropoutRateSemester = semesterNewStudents.length
    ? semesterNewStudents.filter((item) => !item.active).length / semesterNewStudents.length
    : 0;

  const delinquencyRate = 0.052;

  const courseOrder = ["ADS", "Eng. Software", "Ciencia da Computacao", "SI"];
  const byCourse = new Map<string, number>();
  for (const student of students) {
    byCourse.set(student.course, (byCourse.get(student.course) ?? 0) + 1);
  }

  const distribution = courseOrder
    .map((name) => ({ name, value: byCourse.get(name) ?? 0 }))
    .filter((item) => item.value > 0);

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
