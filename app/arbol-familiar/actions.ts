"use server";

import sql from "@/lib/db";

type RelationType = "madre" | "padre" | "pareja" | "hijo";

type CreatePersonInput = {
  name: string;
  first_lastname: string;
  second_lastname: string;
  gender?: "mujer" | "hombre" | "no encontrado";
  relationType: RelationType;
  relatedPersonId: string;
  partnerId?: string;
};

const relationTypeMap: Record<RelationType, "padre_hijx" | "madre_hijx" | "compañerxs"> = {
  madre: "madre_hijx",
  padre: "padre_hijx",
  pareja: "compañerxs",
  hijo: "padre_hijx",
};

export type PotentialPartner = {
  id: string;
  name: string | null;
  first_lastname: string;
  second_lastname: string | null;
};

export async function getPotentialPartners(personId: string, relationType: RelationType): Promise<PotentialPartner[]> {
  if (relationType === "madre") {
    return await sql<PotentialPartner[]>`
      SELECT p.id, p.name, p.first_lastname, p.second_lastname
      FROM relations r
      INNER JOIN persons p ON p.id = r.first_person_id
      WHERE r.second_person_id = ${personId}
        AND r.type = 'padre_hijx'
        AND p.deleted_at IS NULL
    `;
  }

  if (relationType === "padre") {
    return await sql<PotentialPartner[]>`
      SELECT p.id, p.name, p.first_lastname, p.second_lastname
      FROM relations r
      INNER JOIN persons p ON p.id = r.first_person_id
      WHERE r.second_person_id = ${personId}
        AND r.type = 'madre_hijx'
        AND p.deleted_at IS NULL
    `;
  }

  if (relationType === "hijo") {
    return await sql<PotentialPartner[]>`
      SELECT p.id, p.name, p.first_lastname, p.second_lastname
      FROM relations r
      INNER JOIN persons p
        ON (p.id = r.first_person_id OR p.id = r.second_person_id)
        AND p.id != ${personId}
      WHERE (r.first_person_id = ${personId} OR r.second_person_id = ${personId})
        AND r.type = 'compañerxs'
        AND p.deleted_at IS NULL
    `;
  }

  return [];
}

export async function createPersonWithRelation(input: CreatePersonInput) {
  const { name, first_lastname, second_lastname, gender: inputGender, relationType, relatedPersonId, partnerId } = input;

  const gender = inputGender || (relationType === "madre" ? "mujer" : relationType === "padre" ? "hombre" : "no encontrado");

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

  if (partnerId) {
    if (relationType === "madre" || relationType === "padre") {
      const existing = await sql<{ id: string }[]>`
        SELECT id FROM relations
        WHERE type = 'compañerxs'
          AND (
            (first_person_id = ${newPerson.id} AND second_person_id = ${partnerId})
            OR (first_person_id = ${partnerId} AND second_person_id = ${newPerson.id})
          )
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO relations (type, first_person_id, second_person_id)
          VALUES ('compañerxs', ${newPerson.id}, ${partnerId})
        `;
      }
    }

    if (relationType === "hijo") {
      const partnerGender = await sql<{ gender: string }[]>`
        SELECT gender FROM persons WHERE id = ${partnerId}
      `;
      const otherParentType = partnerGender[0]?.gender === "mujer" ? "madre_hijx" : "padre_hijx";
      await sql`
        INSERT INTO relations (type, first_person_id, second_person_id)
        VALUES (${otherParentType}, ${partnerId}, ${newPerson.id})
      `;
    }
  }

  return { id: newPerson.id };
}
