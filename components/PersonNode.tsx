"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

export type PersonNodeData = {
  label: string;
  initials: string;
  dates: string;
  gender: "mujer" | "hombre" | "no encontrado";
  generation: number;
};

function getNodeColors(gender: string, isRoot: boolean) {
  if (isRoot) {
    return { bg: "#1F3350", border: "#0F1F35" };
  }
  if (gender === "mujer") {
    return { bg: "#C1653A", border: "#9E3A32" };
  }
  if (gender === "hombre") {
    return { bg: "#6B7A4A", border: "#4A5A2A" };
  }
  return { bg: "#9E7B4F", border: "#6B5D45" };
}

export default function PersonNode({ data }: NodeProps) {
  const nodeData = data as unknown as PersonNodeData;
  const { bg, border } = getNodeColors(nodeData.gender, nodeData.generation === 0);

  return (
    <div style={{ width: 64, position: "relative", cursor: "pointer" }}>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, bottom: -30 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0, top: 32 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0, top: 32 }} />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: bg,
          border: `3px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F1E6CC",
          fontWeight: 700,
          fontSize: 18,
          fontFamily: "var(--font-playfair), Georgia, serif",
          letterSpacing: 1,
          boxShadow: "0 2px 8px rgba(61,54,43,0.2)",
        }}
      >
        {nodeData.initials}
      </div>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          fontSize: 11,
          fontWeight: 500,
          color: "#3D362B",
          textAlign: "center",
          fontFamily: "var(--font-playfair), Georgia, serif",
        }}
      >
        {nodeData.label}
      </div>
      {nodeData.dates && (
        <div
          style={{
            position: "absolute",
            top: 86,
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 10,
            color: "#6B5D45",
            fontFamily: "var(--font-jetbrains), monospace",
            textAlign: "center",
          }}
        >
          {nodeData.dates}
        </div>
      )}
    </div>
  );
}
