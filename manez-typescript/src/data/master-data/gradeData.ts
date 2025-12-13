export interface IGrade {
  id: number;
  name: string;
  level?: string;
  salary_range?: string;
  description: string;
}

export const gradeData: IGrade[] = [
  {
    id: 1,
    name: "A1",
    description: "Senior Level",
  },
  {
    id: 2,
    name: "B2",
    description: "Mid Level",
  },
];