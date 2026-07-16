"use client";

import { useState } from "react";

type RelationType = "madre" | "padre" | "pareja" | "hijo";

type Props = {
  relationType: RelationType;
  relatedPersonName: string;
  onSave: (data: AddPersonData) => void;
  onCancel: () => void;
};

export type AddPersonData = {
  name: string;
  first_lastname: string;
  second_lastname: string;
  union_type?: "matrimonio" | "union_libre";
  date_start?: string;
  date_end?: string;
};

const titles: Record<RelationType, string> = {
  madre: "Nueva Madre",
  padre: "Nuevo Padre",
  pareja: "Nueva Unión",
  hijo: "Nuevo Hijo/a",
};

const subtitles: Record<RelationType, (name: string) => string> = {
  madre: (name) => `Madre de ${name}`,
  padre: (name) => `Padre de ${name}`,
  pareja: (name) => `Pareja de ${name}`,
  hijo: (name) => `Hijo/a de ${name}`,
};

export default function AddPersonPanel({
  relationType,
  relatedPersonName,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState("");
  const [firstLastname, setFirstLastname] = useState("");
  const [secondLastname, setSecondLastname] = useState("");
  const [unionType, setUnionType] = useState<"matrimonio" | "union_libre">("matrimonio");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const handleSubmit = () => {
    onSave({
      name,
      first_lastname: firstLastname,
      second_lastname: secondLastname,
      ...(relationType === "pareja" && {
        union_type: unionType,
        date_start: dateStart,
        date_end: dateEnd,
      }),
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 420,
        height: "100vh",
        backgroundColor: "#F1E6CC",
        borderLeft: "1px solid #B8A576",
        boxShadow: "-4px 0 24px rgba(61,54,43,0.12)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        padding: 32,
        overflowY: "auto",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: "#6B5D45",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {titles[relationType]}
      </span>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#3D362B",
          margin: "0 0 24px 0",
        }}
      >
        {subtitles[relationType](relatedPersonName)}
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nombre</label>
          <input
            type="text"
            placeholder="Ej. Ricardo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Apellidos</label>
          <input
            type="text"
            placeholder="Ej. Valdés"
            value={firstLastname}
            onChange={(e) => setFirstLastname(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Segundo Apellido</label>
        <input
          type="text"
          placeholder="Ej. López"
          value={secondLastname}
          onChange={(e) => setSecondLastname(e.target.value)}
          style={inputStyle}
        />
      </div>

      {relationType === "pareja" && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tipo de unión</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button
                onClick={() => setUnionType("matrimonio")}
                style={{
                  ...pillStyle,
                  backgroundColor: unionType === "matrimonio" ? "#6B7A4A" : "#E9DBB8",
                  color: unionType === "matrimonio" ? "#F1E6CC" : "#3D362B",
                  borderColor: unionType === "matrimonio" ? "#6B7A4A" : "#B8A576",
                }}
              >
                Matrimonio
              </button>
              <button
                onClick={() => setUnionType("union_libre")}
                style={{
                  ...pillStyle,
                  backgroundColor: unionType === "union_libre" ? "#6B7A4A" : "#E9DBB8",
                  color: unionType === "union_libre" ? "#F1E6CC" : "#3D362B",
                  borderColor: unionType === "union_libre" ? "#6B7A4A" : "#B8A576",
                }}
              >
                Unión libre
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Fecha inicio</label>
              <input
                type="text"
                placeholder="1958-06-14"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Fecha fin <span style={{ color: "#B8A576" }}>(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="–"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 24 }}>
        <button onClick={onCancel} style={cancelButtonStyle}>
          Cancelar
        </button>
        <button onClick={handleSubmit} style={saveButtonStyle}>
          Guardar en el árbol
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  color: "#6B5D45",
  textTransform: "uppercase",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #B8A576",
  backgroundColor: "#E9DBB8",
  fontSize: 14,
  color: "#3D362B",
  outline: "none",
};

const pillStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "transparent",
  border: "none",
  color: "#3D362B",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  padding: "10px 24px",
  backgroundColor: "#9E3A32",
  border: "none",
  borderRadius: 8,
  color: "#F1E6CC",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(158,58,50,0.3)",
};
