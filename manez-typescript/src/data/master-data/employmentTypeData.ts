export interface IEmploymentType {
  id: number;
  name: string;
  description?: string;
}

export const employmentTypeData: IEmploymentType[] = [
  {
    id: 1,
    name: "Full-time",
    description: "Full-time employment",
  },
  {
    id: 2,
    name: "Part-time",
    description: "Part-time employment",
  },
]
