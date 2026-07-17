"use client";

import { useState } from "react";
import Link from "next/link";
import EditPersonPanel from "./EditPersonPanel";
import type { PersonDetail } from "@/services/persons";

type Props = {
  person: PersonDetail;
};

export default function PersonDetailContent({ person }: Props) {
  const [editing, setEditing] = useState(false);

  const fullName = `${person.name || ""} ${person.first_lastname} ${person.second_lastname || ""}`.trim();
  const initials = ((person.name?.[0] || person.first_lastname[0]) + person.first_lastname[0]).toUpperCase();

  const birthEvent = person.events.find((e) => e.type === "nacimiento");
  const deathEvent = person.events.find((e) => e.type === "defunción");

  const dateStr = [birthEvent?.date, deathEvent?.date].filter(Boolean).join(" — ");
  const placeStr = [birthEvent?.place, birthEvent?.state, birthEvent?.country].filter(Boolean).join(", ");
  const subtitle = [dateStr, placeStr].filter(Boolean).join("  ·  ");

  const unions = person.family.filter((f) => f.relation_type === "compañerxs").length;
  const children = person.family.filter((f) => f.relation_type === "padre_hijx" || f.relation_type === "madre_hijx").length;

  const timelineEvents = person.events
    .filter((e) => e.date)
    .map((e) => ({ date: e.date!, label: e.type, id: e.id }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1.5, color: "#6B5D45", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "var(--font-jetbrains), monospace" }}>
            Expediente no. {person.id.slice(0, 4).toUpperCase()}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: "#1F3350", margin: "0 0 8px", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {fullName}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: "#6B5D45", margin: 0, fontFamily: "var(--font-jetbrains), monospace" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {person.completed && (
            <div
              style={{
                border: "2px solid #6B7A4A",
                borderRadius: 4,
                padding: "6px 16px",
                color: "#6B7A4A",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                transform: "rotate(2deg)",
              }}
            >
              Completado
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1F3350",
              border: "none",
              borderRadius: 6,
              color: "#F1E6CC",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
        </div>
      </div>

      {/* Content: 3 columns */}
      <div style={{ display: "flex", gap: 32, maxWidth: 900 }}>
        {/* Left: photo + stats */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div
            style={{
              width: 180,
              height: 220,
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

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatRow label="Uniones" value={unions} />
            <StatRow label="Hijos" value={children} />
            <StatRow label="Documentos" value={person.documents.length} />
          </div>
        </div>

        {/* Center: bio */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <section>
            <h2 style={sectionTitle}>Biografía</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#3D362B", margin: 0 }}>
              {person.events.find((e) => e.description)?.description || "Sin biografía registrada."}
            </p>
          </section>
        </div>

        {/* Right: family + timeline */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {person.family.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={sectionTitle}>Familia inmediata</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {person.family.map((member) => {
                  const memberInitials = (
                    (member.name?.[0] || member.first_lastname[0]) + member.first_lastname[0]
                  ).toUpperCase();
                  const memberName = `${member.name || ""} ${member.first_lastname} ${member.second_lastname?.[0] ? member.second_lastname[0] + "." : ""}`.trim();

                  return (
                    <Link
                      key={member.id}
                      href={`/arbol-familiar/${member.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        textDecoration: "none",
                        color: "#3D362B",
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: member.relation_type === "compañerxs" ? "#C1653A" : "#6B7A4A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F1E6CC",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
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

          {timelineEvents.length > 0 && (
            <section>
              <h2 style={sectionTitle}>Línea de tiempo</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {timelineEvents.map((evt) => (
                  <div key={evt.id} style={{ display: "flex", gap: 8, fontSize: 13, color: "#3D362B" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", color: "#6B5D45", whiteSpace: "nowrap" }}>{evt.date}</span>
                    <span>·</span>
                    <span style={{ textTransform: "capitalize" }}>{evt.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Documents section */}
      {person.documents.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={sectionTitle}>Documentos</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {person.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 140,
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 160,
                    backgroundColor: "#E4D4AC",
                    border: "1px solid #B8A576",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <DocThumbnail url={doc.url} />
                </div>
                {doc.name && (
                  <span style={{ fontSize: 11, color: "#6B5D45", textAlign: "center", lineHeight: 1.4, maxWidth: 140, wordBreak: "break-word", fontFamily: "var(--font-jetbrains), monospace" }}>
                    {doc.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Edit panel */}
      {editing && (
        <EditPersonPanel
          person={person}
          events={person.events}
          documents={person.documents}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function DocThumbnail({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F3350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span style={{ fontSize: 10, color: "#6B5D45" }}>PDF</span>
      </>
    );
  }

  return (
    <img
      src={url}
      alt="documento"
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 3 }}
    />
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#6B5D45", fontFamily: "var(--font-jetbrains), monospace" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1F3350", fontFamily: "var(--font-jetbrains), monospace" }}>{value}</span>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#1F3350",
  margin: "0 0 12px",
  fontFamily: "var(--font-playfair), Georgia, serif",
};
