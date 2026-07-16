import sql from "@/lib/db";

export type Relation = {
  id: string;
  type: "padre_hijx" | "madre_hijx" | "compañerxs";
  first_person_id: string;
  second_person_id: string;
};

export async function getRelationsByPersonId(personId: string) {
  return await sql<Relation[]>`
    SELECT
      r.id,
      r.type,
      r.first_person_id,
      r.second_person_id
    FROM relations r
    WHERE (r.first_person_id = ${personId} OR r.second_person_id = ${personId})
  `;
}

export async function getAllRelations() {
  return await sql<Relation[]>`
    SELECT
      r.id,
      r.type,
      r.first_person_id,
      r.second_person_id
    FROM relations r
  `;
}
