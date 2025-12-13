 export interface IDesignation {
  id: number;
  name: string;
  department: number | string;

}

export const designationData: IDesignation[] = [
  {
    id: 1,
    name: "Software Engineer",
    department: "IT",
  },
  {
    id: 2,
    name: "Team Lead",
    department: "IT",
  },
]