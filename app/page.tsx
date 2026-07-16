import { getPersons } from "@/services/persons";
import { getAllRelations } from "@/services/relations";
import FamilyTree from "@/components/FamilyTree";

export default async function HomePage() {
  const [persons, relations] = await Promise.all([
    getPersons(),
    getAllRelations(),
  ]);

  const rootPerson = persons[0];

  if (!rootPerson) {
    return (
      <main>
        <p>No hay personas registradas.</p>
      </main>
    );
  }

  return <FamilyTree persons={persons} relations={relations} rootPersonId={rootPerson.id} />;
}
