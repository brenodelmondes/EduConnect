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

export function getAdminMetrics(): AdminMetrics {
  return {
    studentsTotal: 1280,
    teachersTotal: 84,
    activeClasses: 32,

    newEnrollmentsSemester: 210,
    dropoutRateSemester: 0.034,
    delinquencyRate: 0.052,

    pendingEnrollments: 12,
    docsToValidate: 7,
    classesWithoutTeacher: 2,

    distribution: [
      { name: "ADS", value: 420 },
      { name: "Eng. Software", value: 310 },
      { name: "Ciência da Computação", value: 280 },
      { name: "SI", value: 270 },
    ],
  };
}
