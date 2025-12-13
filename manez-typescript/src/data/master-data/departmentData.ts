export interface IDepartment {
  id: number;
  name: string;
  description: string;
}

export const departmentData: IDepartment[] = [
  {
    id: 1,
    name: "IT",
    description: "Information Technology",
  },
  {
    id: 2,
    name: "HR",
    description: "Human Resources",
  },
];