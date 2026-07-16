"use client";

type RelationOption = "madre" | "padre" | "pareja" | "hijo";

type Props = {
  x: number;
  y: number;
  onSelect: (option: RelationOption) => void;
  onClose: () => void;
};

const options: { key: RelationOption; label: string; dx: number; dy: number }[] = [
  { key: "madre", label: "+ Madre", dx: 0, dy: -80 },
  { key: "padre", label: "+ Padre", dx: -140, dy: 0 },
  { key: "pareja", label: "+ Pareja", dx: 140, dy: 0 },
  { key: "hijo", label: "+ Hijo", dx: 0, dy: 80 },
];

export default function NodeContextMenu({ x, y, onSelect, onClose }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{
              position: "absolute",
              left: opt.dx - 60,
              top: opt.dy - 18,
              width: 120,
              height: 36,
              borderRadius: 20,
              border: "1.5px dashed #B8A576",
              backgroundColor: "#F1E6CC",
              color: "#3D362B",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(61,54,43,0.1)",
              transition: "background-color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E4D4AC";
              e.currentTarget.style.borderColor = "#9E7B4F";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F1E6CC";
              e.currentTarget.style.borderColor = "#B8A576";
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}
