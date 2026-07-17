import sql from "@/lib/db";
import type { Person } from "@/types/person";
import type { Event } from "@/types/event";
import type { Document } from "@/types/document";
import type { Photo } from "@/types/photo";

export type FamilyMember = {
  id: string;
  name: string | null;
  first_lastname: string;
  second_lastname: string | null;
  relation_type: string;
};

export type PersonDetail = Person & {
  events: Event[];
  documents: Document[];
  photos: Photo[];
  family: FamilyMember[];
};

export type PersonWithDates = Person & {
  birth_date: string | null;
  death_date: string | null;
};

export async function getPersons() {
  return await sql<PersonWithDates[]>`
    SELECT
      p.id,
      p.name,
      p.first_lastname,
      p.second_lastname,
      p.gender,
      p.completed,
      (SELECT e.date FROM events e INNER JOIN person_events pe ON pe.event_id = e.id WHERE pe.person_id = p.id AND e.type = 'nacimiento' AND e.deleted_at IS NULL LIMIT 1) AS birth_date,
      (SELECT e.date FROM events e INNER JOIN person_events pe ON pe.event_id = e.id WHERE pe.person_id = p.id AND e.type = 'defunción' AND e.deleted_at IS NULL LIMIT 1) AS death_date
    FROM persons p
    WHERE p.deleted_at IS NULL
  `;
}

export async function getPersonById(id: string) {
  const rows = await sql<Person[]>`
    SELECT
      p.id,
      p.name,
      p.first_lastname,
      p.second_lastname,
      p.gender,
      p.completed
    FROM persons p
    WHERE p.id = ${id}
      AND p.deleted_at IS NULL
  `;
  return rows[0] ?? null;
}

export async function getPersonDetailById(id: string): Promise<PersonDetail | null> {
  const person = await getPersonById(id);
  if (!person) return null;

  const [events, documents, photos, family] = await Promise.all([
    sql<Event[]>`
      SELECT
        e.id,
        e.type,
        e.date,
        e.place,
        e.state,
        e.country,
        e.description
      FROM events e
      INNER JOIN person_events pe ON pe.event_id = e.id
      WHERE pe.person_id = ${id}
        AND e.deleted_at IS NULL
        AND pe.deleted_at IS NULL
    `,
    sql<Document[]>`
      SELECT
        d.id,
        d.url,
        d.name,
        d.source,
        d.event_id
      FROM documents d
      WHERE d.person_id = ${id}
        AND d.deleted_at IS NULL
    `,
    sql<Photo[]>`
      SELECT
        ph.id,
        ph.url,
        ph.description
      FROM photos ph
      WHERE ph.person_id = ${id}
        AND ph.deleted_at IS NULL
    `,
    sql<FamilyMember[]>`
      SELECT
        p.id,
        p.name,
        p.first_lastname,
        p.second_lastname,
        r.type AS relation_type
      FROM relations r
      INNER JOIN persons p
        ON (p.id = r.first_person_id OR p.id = r.second_person_id)
        AND p.id != ${id}
      WHERE (r.first_person_id = ${id} OR r.second_person_id = ${id})
        AND p.deleted_at IS NULL
    `,
  ]);

  return { ...person, events, documents, photos, family };
}
