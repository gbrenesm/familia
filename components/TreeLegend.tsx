"use client";

export default function TreeLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 12,
        color: "#6B5D45",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 0,
            borderTop: "2px solid #3D362B",
          }}
        />
        <span>biológico</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 0,
            borderTop: "2px dashed #C08A2E",
          }}
        />
        <span>adoptivo</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 0,
            borderTop: "2px solid #1F3350",
          }}
        />
        <span>unión</span>
      </div>
    </div>
  );
}
