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

export default function PersonNode({ data }: NodeProps) {
  const nodeData = data as unknown as PersonNodeData;
  const isRoot = nodeData.generation === 0;
  const bg = isRoot ? "#C1653A" : "#9E7B4F";
  const border = isRoot ? "#9E3A32" : "#6B5D45";

  return (
    <div style={{ textAlign: "center", cursor: "pointer", minWidth: 100 }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
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
          margin: "0 auto",
          color: "#F1E6CC",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 1,
          boxShadow: "0 2px 8px rgba(61,54,43,0.2)",
        }}
      >
        {nodeData.initials}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "#3D362B",
          fontFamily: "inherit",
        }}
      >
        {nodeData.label}
      </div>
      {nodeData.dates && (
        <div style={{ fontSize: 11, color: "#6B5D45", marginTop: 2, fontFamily: "monospace" }}>
          {nodeData.dates}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
