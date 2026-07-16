export type Event = {
  id: string;
  type: "nacimiento" | "defunción" | "bautizo" | "matrimonio" | "otro";
  date: string | null;
  place: string | null;
  state: string | null;
  country: string | null;
  description: string | null;
};
