"use server";

import sql from "@/lib/db";

type RelationType = "madre" | "padre" | "pareja" | "hijo";

type CreatePersonInput = {
  name: string;
  first_lastname: string;
  second_lastname: string;
  relationType: RelationType;
  relatedPersonId: string;
};

const relationTypeMap: Record<RelationType, "padre_hijx" | "madre_hijx" | "compañerxs"> = {
  madre: "madre_hijx",
  padre: "padre_hijx",
  pareja: "compañerxs",
  hijo: "padre_hijx",
};

export async function createPersonWithRelation(input: CreatePersonInput) {
  const { name, first_lastname, second_lastname, relationType, relatedPersonId } = input;

  const gender = relationType === "madre" ? "mujer" : relationType === "padre" ? "hombre" : "no encontrado";

  const [newPerson] = await sql<{ id: string }[]>`
    INSERT INTO persons (name, first_lastname, second_lastname, gender)
    VALUES (${name || null}, ${first_lastname}, ${second_lastname || null}, ${gender})
    RETURNING id
  `;

  const dbRelationType = relationTypeMap[relationType];

  let firstPersonId: string;
  let secondPersonId: string;

  if (relationType === "hijo") {
    firstPersonId = relatedPersonId;
    secondPersonId = newPerson.id;
  } else if (relationType === "madre" || relationType === "padre") {
    firstPersonId = newPerson.id;
    secondPersonId = relatedPersonId;
  } else {
    firstPersonId = relatedPersonId;
    secondPersonId = newPerson.id;
  }

  await sql`
    INSERT INTO relations (type, first_person_id, second_person_id)
    VALUES (${dbRelationType}, ${firstPersonId}, ${secondPersonId})
  `;

  return { id: newPerson.id };
}
