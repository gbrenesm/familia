import Link from "next/link";
import { getPersonDetailById } from "@/services/persons";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const person = await getPersonDetailById(id);

  if (!person) {
    return (
      <main style={{ padding: 48, backgroundColor: "#F1E6CC", minHeight: "100vh" }}>
        <p style={{ color: "#3D362B" }}>Persona no encontrada.</p>
      </main>
    );
  }

  const fullName = `${person.name || ""} ${person.first_lastname} ${person.second_lastname || ""}`.trim();
  const initials = ((person.name?.[0] || person.first_lastname[0]) + person.first_lastname[0]).toUpperCase();

  const birthEvent = person.events.find((e) => e.type === "nacimiento");
  const deathEvent = person.events.find((e) => e.type === "defunción");

  const dateStr = [birthEvent?.date, deathEvent?.date].filter(Boolean).join(" — ");
  const placeStr = [birthEvent?.place, birthEvent?.state, birthEvent?.country].filter(Boolean).join(", ");
  const subtitle = [dateStr, placeStr].filter(Boolean).join("  ·  ");

  const unions = person.family.filter((f) => f.relation_type === "compañerxs").length;
  const children = person.family.filter((f) => f.relation_type === "padre_hijx" || f.relation_type === "madre_hijx").length;

  return (
    <main
      style={{
        backgroundColor: "#F1E6CC",
        minHeight: "100vh",
        padding: "48px 64px",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Link
            href="/"
            style={{ fontSize: 12, color: "#6B5D45", textDecoration: "none", marginBottom: 8, display: "inline-block" }}
          >
            ← Volver al árbol
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#6B5D45", textTransform: "uppercase", margin: "8px 0 4px" }}>
            Expediente no. {id.slice(0, 4).toUpperCase()}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1F3350", margin: "0 0 8px" }}>
            {fullName}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 14, color: "#6B5D45", margin: 0, fontFamily: "monospace" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Sello COMPLETADO */}
        {person.completed && (
          <div
            style={{
              border: "2px solid #6B7A4A",
              borderRadius: 4,
              padding: "6px 16px",
              color: "#6B7A4A",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              transform: "rotate(2deg)",
            }}
          >
            Completado
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ display: "flex", gap: 48 }}>
        {/* Left column: photo + stats */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div
            style={{
              width: 200,
              height: 240,
              backgroundColor: "#E4D4AC",
              border: "2px solid #B8A576",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {person.photos.length > 0 ? (
              <img
                src={person.photos[0].url}
                alt={fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }}
              />
            ) : (
              <span style={{ fontSize: 48, color: "#B8A576" }}>
                {initials}
              </span>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatRow label="Uniones" value={unions} />
            <StatRow label="Hijos" value={children} />
            <StatRow label="Documentos" value={person.documents.length} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 1 }}>
          {/* Biografía */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={sectionTitle}>Biografía</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#3D362B" }}>
              {person.events.find((e) => e.description)?.description || "Sin biografía registrada."}
            </p>
          </section>

          {/* Documentos */}
          {person.documents.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={sectionTitle}>Documentos</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {person.documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      width: 110,
                      height: 110,
                      backgroundColor: "#E4D4AC",
                      border: "1px solid #B8A576",
                      borderRadius: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 24, color: "#1F3350" }}>📄</span>
                    <span style={{ fontSize: 11, color: "#6B5D45" }}>Documento</span>
                  </div>
                ))}
                {person.documents.length > 3 && (
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      backgroundColor: "#E9DBB8",
                      border: "1px dashed #B8A576",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#6B5D45",
                    }}
                  >
                    +{person.documents.length - 3} más
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Familia inmediata */}
          {person.family.length > 0 && (
            <section>
              <h2 style={sectionTitle}>Familia inmediata</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {person.family.map((member) => {
                  const memberInitials = (
                    (member.name?.[0] || member.first_lastname[0]) + member.first_lastname[0]
                  ).toUpperCase();
                  const memberName = `${member.name || ""} ${member.first_lastname} ${member.second_lastname?.[0] || ""}.`.trim();

                  return (
                    <Link
                      key={member.id}
                      href={`/arbol-familiar/${member.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        backgroundColor: "#E9DBB8",
                        border: "1px solid #B8A576",
                        borderRadius: 24,
                        textDecoration: "none",
                        color: "#3D362B",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: member.relation_type === "compañerxs" ? "#C1653A" : "#6B7A4A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F1E6CC",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {memberInitials}
                      </div>
                      {memberName}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#6B5D45" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1F3350" }}>{value}</span>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#1F3350",
  margin: "0 0 12px",
};
