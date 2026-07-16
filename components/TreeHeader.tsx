"use client";

type PersonOption = {
  id: string;
  label: string;
};

type Props = {
  persons: PersonOption[];
  rootPersonId: string;
  generations: number;
  onRootChange: (id: string) => void;
  onGenerationsChange: (n: number) => void;
};

export default function TreeHeader({
  persons,
  rootPersonId,
  generations,
  onRootChange,
  onGenerationsChange,
}: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid #B8A576",
        backgroundColor: "#E9DBB8",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#6B5D45",
            textTransform: "uppercase",
          }}
        >
          Raíz
        </span>
        <select
          value={rootPersonId}
          onChange={(e) => onRootChange(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: "1px solid #B8A576",
            backgroundColor: "#F1E6CC",
            fontSize: 14,
            color: "#3D362B",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#6B5D45",
            textTransform: "uppercase",
          }}
        >
          Generaciones ±{generations}
        </span>
        <button
          onClick={() => onGenerationsChange(Math.max(1, generations - 1))}
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            border: "1px solid #B8A576",
            backgroundColor: "#F1E6CC",
            cursor: "pointer",
            fontSize: 16,
            color: "#3D362B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <button
          onClick={() => onGenerationsChange(generations + 1)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            border: "1px solid #B8A576",
            backgroundColor: "#F1E6CC",
            cursor: "pointer",
            fontSize: 16,
            color: "#3D362B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>
    </header>
  );
}
