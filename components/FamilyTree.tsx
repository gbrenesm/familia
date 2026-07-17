"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import PersonNode from "./PersonNode";
import TreeHeader from "./TreeHeader";
import TreeLegend from "./TreeLegend";
import NodeContextMenu from "./NodeContextMenu";
import AddPersonPanel from "./AddPersonPanel";
import { createPersonWithRelation, getPotentialPartners } from "@/app/arbol-familiar/actions";
import type { PotentialPartner } from "@/app/arbol-familiar/actions";
import type { AddPersonData } from "./AddPersonPanel";
import type { PersonNodeData } from "./PersonNode";

type PersonInput = {
  id: string;
  name: string | null;
  first_lastname: string;
  second_lastname: string | null;
  gender: "mujer" | "hombre" | "no encontrado";
  birth_date?: string | null;
  death_date?: string | null;
};

type RelationInput = {
  id: string;
  type: "padre_hijx" | "madre_hijx" | "compañerxs";
  first_person_id: string;
  second_person_id: string;
};

type Props = {
  persons: PersonInput[];
  relations: RelationInput[];
  rootPersonId: string;
};

type RelationOption = "madre" | "padre" | "pareja" | "hijo";

function getInitials(person: PersonInput): string {
  const first = person.name?.[0] || person.first_lastname[0];
  const last = person.first_lastname[0];
  return (first + last).toUpperCase();
}

function getLabel(person: PersonInput): string {
  const name = person.name || "";
  return `${name} ${person.first_lastname} ${person.second_lastname || ""}`.trim();
}

function getFullLabel(person: PersonInput): string {
  const name = person.name || "";
  return `${name} ${person.first_lastname} ${person.second_lastname || ""}`.trim();
}

function buildTree(
  persons: PersonInput[],
  relations: RelationInput[],
  rootId: string,
  maxGenerations: number
) {
  const personMap = new Map(persons.map((p) => [p.id, p]));
  const visited = new Set<string>();
  const positionMap = new Map<string, { x: number; y: number; generation: number }>();

  const X_GAP = 280;
  const Y_GAP = 180;
  const PARTNER_GAP = 280;

  type QueueItem = { id: string; x: number; y: number; generation: number };
  const queue: QueueItem[] = [{ id: rootId, x: 0, y: 0, generation: 0 }];
  visited.add(rootId);

  while (queue.length > 0) {
    const { id, x, y, generation } = queue.shift()!;
    const person = personMap.get(id);
    if (!person) continue;

    positionMap.set(id, { x, y, generation });

    if (generation >= maxGenerations) continue;

    const personRelations = relations.filter(
      (r) => r.first_person_id === id || r.second_person_id === id
    );

    const partnerRel = personRelations.find((r) => r.type === "compañerxs");
    const partnerId = partnerRel
      ? (partnerRel.first_person_id === id ? partnerRel.second_person_id : partnerRel.first_person_id)
      : null;
    const partnerPos = partnerId ? positionMap.get(partnerId) : null;
    const midX = partnerPos ? (x + partnerPos.x) / 2 : x;

    const children: string[] = [];
    let parentIndex = 0;

    for (const rel of personRelations) {
      const otherId = rel.first_person_id === id ? rel.second_person_id : rel.first_person_id;
      if (visited.has(otherId)) continue;

      const isParentOfOther = rel.type === "padre_hijx" || rel.type === "madre_hijx";
      const otherIsParent = isParentOfOther && rel.second_person_id === id;

      if (rel.type === "compañerxs") {
        visited.add(otherId);
        queue.push({ id: otherId, x: x + PARTNER_GAP, y, generation: generation + 1 });
      } else if (otherIsParent) {
        visited.add(otherId);
        const newX = x + (parentIndex - 0.5) * PARTNER_GAP;
        queue.push({ id: otherId, x: newX, y: y - Y_GAP, generation: generation + 1 });
        parentIndex++;
      } else {
        children.push(otherId);
      }
    }

    if (children.length > 0) {
      const totalWidth = (children.length - 1) * X_GAP;
      const startX = midX - totalWidth / 2;
      children.forEach((childId, i) => {
        visited.add(childId);
        queue.push({ id: childId, x: startX + i * X_GAP, y: y + Y_GAP, generation: generation + 1 });
      });
    }
  }

  const nodes = Array.from(positionMap.entries()).map(([id, pos]) => {
    const person = personMap.get(id)!;
    const dates = [person.birth_date, person.death_date].filter(Boolean).join("–") || "";
    return {
      id,
      type: "person",
      position: { x: pos.x, y: pos.y },
      data: {
        label: getLabel(person),
        initials: getInitials(person),
        dates,
        gender: person.gender,
        generation: pos.generation,
      } as PersonNodeData,
    };
  });

  const nodeIds = new Set(positionMap.keys());
  const edges: { id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; type?: string; style?: object }[] = [];

  for (const rel of relations) {
    if (!nodeIds.has(rel.first_person_id) || !nodeIds.has(rel.second_person_id)) continue;

    if (rel.type === "compañerxs") {
      const pos1 = positionMap.get(rel.first_person_id)!;
      const pos2 = positionMap.get(rel.second_person_id)!;
      const leftId = pos1.x <= pos2.x ? rel.first_person_id : rel.second_person_id;
      const rightId = pos1.x <= pos2.x ? rel.second_person_id : rel.first_person_id;
      edges.push({
        id: rel.id,
        source: leftId,
        target: rightId,
        sourceHandle: "right",
        targetHandle: "left",
        type: "straight",
        style: { stroke: "#3D362B", strokeWidth: 2 },
      });
    } else {
      const parentId = rel.first_person_id;
      const childId = rel.second_person_id;
      edges.push({
        id: rel.id,
        source: parentId,
        target: childId,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        style: { stroke: "#3D362B", strokeWidth: 2 },
      });
    }
  }

  return { nodes, edges };
}

function FamilyTreeInner({ persons, relations, rootPersonId }: Props) {
  const nodeTypes = useMemo(() => ({ person: PersonNode }), []);
  const router = useRouter();
  const [rootId, setRootId] = useState(rootPersonId);
  const [generations, setGenerations] = useState(2);

  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  const [panel, setPanel] = useState<{
    relationType: RelationOption;
    personId: string;
    personName: string;
    potentialPartners: PotentialPartner[];
  } | null>(null);

  const flowRef = useRef<HTMLDivElement>(null);
  const { flowToScreenPosition } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildTree(persons, relations, rootId, generations);
    return { initialNodes: nodes, initialEdges: edges };
  }, [persons, relations, rootId, generations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const personOptions = useMemo(
    () => persons.map((p) => ({ id: p.id, label: getFullLabel(p) })),
    [persons]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      router.push(`/arbol-familiar/${node.id}`);
    },
    [router]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) => {
      event.preventDefault();
      const screenPos = flowToScreenPosition({
        x: node.position.x + 50,
        y: node.position.y + 32,
      });
      setContextMenu({ nodeId: node.id, x: screenPos.x, y: screenPos.y });
    },
    [flowToScreenPosition]
  );

  const handleContextSelect = useCallback(
    async (option: RelationOption) => {
      if (!contextMenu) return;
      const person = persons.find((p) => p.id === contextMenu.nodeId);
      if (!person) return;

      const potentialPartners = await getPotentialPartners(contextMenu.nodeId, option);

      setPanel({
        relationType: option,
        personId: contextMenu.nodeId,
        personName: getFullLabel(person),
        potentialPartners,
      });
      setContextMenu(null);
    },
    [contextMenu, persons]
  );

  const handleSave = useCallback(
    async (data: AddPersonData) => {
      if (!panel) return;
      await createPersonWithRelation({
        name: data.name,
        first_lastname: data.first_lastname,
        second_lastname: data.second_lastname,
        gender: data.gender,
        relationType: panel.relationType,
        relatedPersonId: panel.personId,
        partnerId: data.partnerId,
      });
      setPanel(null);
      router.refresh();
    },
    [panel, router]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F1E6CC",
      }}
    >
      <TreeHeader
        persons={personOptions}
        rootPersonId={rootId}
        generations={generations}
        onRootChange={setRootId}
        onGenerationsChange={setGenerations}
      />
      <div style={{ flex: 1, position: "relative" }} ref={flowRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => setContextMenu(null)}
          fitView
          minZoom={0.2}
          maxZoom={2}
          style={{ backgroundColor: "#F1E6CC" }}
        >
          <Controls
            style={{
              borderRadius: 8,
              border: "1px solid #B8A576",
              boxShadow: "0 2px 8px rgba(61,54,43,0.1)",
            }}
          />
        </ReactFlow>
        <TreeLegend />

        {contextMenu && (
          <NodeContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onSelect={handleContextSelect}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>

      {panel && (
        <AddPersonPanel
          relationType={panel.relationType}
          relatedPersonName={panel.personName}
          potentialPartners={panel.potentialPartners}
          onSave={handleSave}
          onCancel={() => setPanel(null)}
        />
      )}
    </div>
  );
}

export default function FamilyTree(props: Props) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner {...props} />
    </ReactFlowProvider>
  );
}
