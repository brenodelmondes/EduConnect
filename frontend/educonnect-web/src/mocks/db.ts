// src/mocks/db.ts
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month1To12: number, day1To31: number) {
  return `${year}-${pad2(month1To12)}-${pad2(day1To31)}`;
}

const COURSE_DISTRIBUTION: Array<{ name: string; count: number }> = [
  { name: "ADS", count: 420 },
  { name: "Eng. Software", count: 310 },
  { name: "Ciência da Computação", count: 280 },
  { name: "SI", count: 270 },
];

const TOTAL_STUDENTS = COURSE_DISTRIBUTION.reduce((acc, c) => acc + c.count, 0);
const NEW_ENROLLMENTS_SEMESTER = 210;

let studentIdCounter = 1;

export const students: Student[] = COURSE_DISTRIBUTION.flatMap(({ name, count }) =>
  Array.from({ length: count }, (_, idxInCourse) => {
    const id = studentIdCounter++;
    const globalIndex = id - 1;
    const isNewThisSemester = globalIndex >= TOTAL_STUDENTS - NEW_ENROLLMENTS_SEMESTER;

    // Mantém uma taxa de inatividade ~3.4% (1 a cada 29)
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

export const teachers: Teacher[] = Array.from({ length: 84 }, (_, i) => {
  const id = i + 1;
  const departments = ["Computação", "Matemática", "Negócios", "Design"];
  return {
    id,
    name: `Professor ${id}`,
    department: departments[i % departments.length],
    active: id % 17 !== 0,
  };
});

export const classes: ClassRoom[] = Array.from({ length: 32 }, (_, i) => {
  const id = i + 1;
  const course = COURSE_DISTRIBUTION[i % COURSE_DISTRIBUTION.length]?.name ?? "ADS";

  // 2 turmas sem professor (para KPI de pendência)
  const teacherId = id > 30 ? null : ((id % 84) + 1);

  return {
    id,
    course,
    active: true,
    teacherId,
  };
});

export const enrollments: Enrollment[] = Array.from(
  { length: NEW_ENROLLMENTS_SEMESTER },
  (_, i) => {
    const id = i + 1;
    const studentId = TOTAL_STUDENTS - NEW_ENROLLMENTS_SEMESTER + id;

    // 12 matrículas pendentes para o card de pendências
    const status: Enrollment["status"] = id <= 12 ? "PENDENTE" : "ATIVA";

    return {
      id,
      studentId,
      status,
      createdAt: isoDate(2026, 1, (i % 28) + 1),
    };
  }
);
