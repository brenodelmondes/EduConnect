export type Student = {
  id: number;
  name: string;
  active: boolean;
  course: string;
  enrolledAt: string;
};

export type Teacher = {
  id: number;
  name: string;
  department: string;
  active: boolean;
};

export type ClassRoom = {
  id: number;
  course: string;
  active: boolean;
  teacherId?: number | null;
};

export type Enrollment = {
  id: number;
  studentId: number;
  status: "PENDENTE" | "ATIVA" | "CANCELADA";
  createdAt: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function isoDate(year: number, month1To12: number, day1To31: number) {
  return `${year}-${pad2(month1To12)}-${pad2(day1To31)}`;
}

const COURSE_DISTRIBUTION: Array<{ name: string; count: number }> = [
  { name: "ADS", count: 420 },
  { name: "Eng. Software", count: 310 },
  { name: "Ciencia da Computacao", count: 280 },
  { name: "SI", count: 270 },
];

const TOTAL_STUDENTS = COURSE_DISTRIBUTION.reduce((acc, item) => acc + item.count, 0);
const NEW_ENROLLMENTS_SEMESTER = 210;

let studentIdCounter = 1;

export const students: Student[] = COURSE_DISTRIBUTION.flatMap(({ name, count }) =>
  Array.from({ length: count }, (_, idxInCourse) => {
    const id = studentIdCounter++;
    const globalIndex = id - 1;
    const isNewThisSemester = globalIndex >= TOTAL_STUDENTS - NEW_ENROLLMENTS_SEMESTER;
    const active = id % 29 !== 0;

    const enrolledAt = isNewThisSemester
      ? isoDate(2026, 1, (idxInCourse % 28) + 1)
      : isoDate(2025, 9, (idxInCourse % 28) + 1);

    return {
      id,
      name: `Aluno ${id}`,
      active,
      course: name,
      enrolledAt,
    };
  })
);

export const teachers: Teacher[] = Array.from({ length: 84 }, (_, index) => {
  const id = index + 1;
  const departments = ["Computacao", "Matematica", "Negocios", "Design"];
  return {
    id,
    name: `Professor ${id}`,
    department: departments[index % departments.length],
    active: id % 17 !== 0,
  };
});

export const classes: ClassRoom[] = Array.from({ length: 32 }, (_, index) => {
  const id = index + 1;
  const course = COURSE_DISTRIBUTION[index % COURSE_DISTRIBUTION.length]?.name ?? "ADS";
  const teacherId = id > 30 ? null : (id % 84) + 1;

  return {
    id,
    course,
    active: true,
    teacherId,
  };
});

export const enrollments: Enrollment[] = Array.from(
  { length: NEW_ENROLLMENTS_SEMESTER },
  (_, index) => {
    const id = index + 1;
    const studentId = TOTAL_STUDENTS - NEW_ENROLLMENTS_SEMESTER + id;
    const status: Enrollment["status"] = id <= 12 ? "PENDENTE" : "ATIVA";

    return {
      id,
      studentId,
      status,
      createdAt: isoDate(2026, 1, (index % 28) + 1),
    };
  }
);
