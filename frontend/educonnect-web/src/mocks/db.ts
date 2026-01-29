// src/mocks/db.ts
export type Student = { id: number; name: string; active: boolean; course: string; enrolledAt: string };
export type Teacher = { id: number; name: string; department: string; active: boolean };
export type ClassRoom = { id: number; course: string; active: boolean };
export type Enrollment = { id: number; studentId: number; status: "PENDENTE" | "ATIVA" | "CANCELADA"; createdAt: string };

export const students: Student[] = [
  { id: 1, name: "Ana Souza", active: true, course: "ADS", enrolledAt: "2026-01-10" },
  { id: 2, name: "Bruno Lima", active: true, course: "ADS", enrolledAt: "2026-01-12" },
  { id: 3, name: "Carla Mendes", active: false, course: "CC", enrolledAt: "2025-08-05" },
  { id: 4, name: "Diego Alves", active: true, course: "CC", enrolledAt: "2026-01-18" },
  { id: 5, name: "Evelyn Rocha", active: true, course: "SI", enrolledAt: "2025-09-20" },
];

export const teachers: Teacher[] = [
  { id: 1, name: "Prof. Marcos", department: "Computação", active: true },
  { id: 2, name: "Profa. Júlia", department: "Matemática", active: true },
  { id: 3, name: "Prof. Renato", department: "Negócios", active: false },
];

export const classes: ClassRoom[] = [
  { id: 1, course: "ADS", active: true },
  { id: 2, course: "CC", active: true },
  { id: 3, course: "SI", active: false },
];

export const enrollments: Enrollment[] = [
  { id: 1, studentId: 1, status: "ATIVA", createdAt: "2026-01-10" },
  { id: 2, studentId: 2, status: "PENDENTE", createdAt: "2026-01-12" },
  { id: 3, studentId: 4, status: "ATIVA", createdAt: "2026-01-18" },
];
