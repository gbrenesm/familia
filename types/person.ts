export type Person = {
  id: string;
  name: string | null;
  first_lastname: string;
  second_lastname: string | null;
  gender: "mujer" | "hombre" | "no encontrado";
  completed: boolean;
};
