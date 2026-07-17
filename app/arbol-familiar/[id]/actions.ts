"use server";

import sql from "@/lib/db";

type UpdatePersonInput = {
  id: string;
  name: string;
  first_lastname: string;
  second_lastname: string;
  gender: "mujer" | "hombre" | "no encontrado";
};

type CreateEventInput = {
  personId: string;
  type: string;
  date: string;
  place: string;
  state: string;
  country: string;
  description: string;
};

export async function updatePerson(input: UpdatePersonInput) {
  await sql`
    UPDATE persons
    SET
      name = ${input.name || null},
      first_lastname = ${input.first_lastname},
      second_lastname = ${input.second_lastname || null},
      gender = ${input.gender},
      updated_at = NOW()
    WHERE id = ${input.id}
  `;
}

export async function createEvent(input: CreateEventInput) {
  const [event] = await sql<{ id: string }[]>`
    INSERT INTO events (type, date, place, state, country, description)
    VALUES (${input.type}, ${input.date || null}, ${input.place || null}, ${input.state || null}, ${input.country || null}, ${input.description || null})
    RETURNING id
  `;

  await sql`
    INSERT INTO person_events (person_id, event_id)
    VALUES (${input.personId}, ${event.id})
  `;

  return { id: event.id };
}

export async function updateEvent(input: { id: string; type: string; date: string; place: string; state: string; country: string; description: string }) {
  await sql`
    UPDATE events SET
      type = ${input.type},
      date = ${input.date || null},
      place = ${input.place || null},
      state = ${input.state || null},
      country = ${input.country || null},
      description = ${input.description || null}
    WHERE id = ${input.id}
  `;
}

export async function deleteEvent(eventId: string) {
  await sql`
    UPDATE events SET deleted_at = NOW() WHERE id = ${eventId}
  `;
}

type CreateDocumentInput = {
  personId: string;
  eventId: string;
  url: string;
  name?: string;
  source?: string;
};

export async function createDocument(input: CreateDocumentInput) {
  const [doc] = await sql<{ id: string }[]>`
    INSERT INTO documents (url, name, source, person_id, event_id)
    VALUES (${input.url}, ${input.name || null}, ${input.source || null}, ${input.personId}, ${input.eventId})
    RETURNING id
  `;
  return { id: doc.id };
}

export async function deleteDocument(documentId: string) {
  await sql`
    UPDATE documents SET deleted_at = NOW() WHERE id = ${documentId}
  `;
}

export async function toggleCompleted(personId: string, completed: boolean) {
  await sql`
    UPDATE persons SET completed = ${completed}, updated_at = NOW()
    WHERE id = ${personId}
  `;
}

export async function deletePerson(personId: string) {
  await sql`
    UPDATE documents SET deleted_at = NOW()
    WHERE person_id = ${personId} AND deleted_at IS NULL
  `;

  await sql`
    UPDATE events SET deleted_at = NOW()
    WHERE id IN (
      SELECT event_id FROM person_events WHERE person_id = ${personId}
    ) AND deleted_at IS NULL
  `;

  await sql`
    DELETE FROM relations
    WHERE first_person_id = ${personId} OR second_person_id = ${personId}
  `;

  await sql`
    UPDATE persons SET deleted_at = NOW() WHERE id = ${personId}
  `;
}
