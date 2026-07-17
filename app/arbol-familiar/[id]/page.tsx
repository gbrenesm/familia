import { getPersonDetailById } from "@/services/persons";
import Sidebar from "@/components/Sidebar";
import PersonDetailContent from "@/components/PersonDetailContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const person = await getPersonDetailById(id);

  if (!person) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1E6CC" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 48 }}>
          <p style={{ color: "#3D362B" }}>Persona no encontrada.</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F1E6CC" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "40px 48px", overflow: "auto" }}>
        <PersonDetailContent person={person} />
      </main>
    </div>
  );
}
