"use client";

import { useCallback, useMemo, useState, useRef } from "react";
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
import { createPersonWithRelation } from "@/app/arbol-familiar/actions";
import type { AddPersonData } from "./AddPersonPanel";
import type { PersonNodeData } from "./PersonNode";

type PersonInput = {
  id: string;
  name: string | null;
  first_lastname: string;
  second_lastname: string | null;
  gender: "mujer" | "hombre" | "no encontrado";
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
  const nodes: { id: string; type: string; position: { x: number; y: number }; data: PersonNodeData }[] = [];
  const edges: { id: string; source: string; target: string; style?: object }[] = [];

  const X_GAP = 200;
  const Y_GAP = 180;

  type QueueItem = { id: string; x: number; y: number; generation: number };
  const queue: QueueItem[] = [{ id: rootId, x: 0, y: 0, generation: 0 }];
  visited.add(rootId);

  while (queue.length > 0) {
    const { id, x, y, generation } = queue.shift()!;
    const person = personMap.get(id);
    if (!person) continue;

    nodes.push({
      id,
      type: "person",
      position: { x, y },
      data: {
        label: getLabel(person),
        initials: getInitials(person),
        dates: "",
        gender: person.gender,
        generation,
      },
    });

    if (generation >= maxGenerations) continue;

    const personRelations = relations.filter(
      (r) => r.first_person_id === id || r.second_person_id === id
    );

    let childIndex = 0;
    let parentIndex = 0;
    for (const rel of personRelations) {
      const otherId = rel.first_person_id === id ? rel.second_person_id : rel.first_person_id;
      if (visited.has(otherId)) continue;
      visited.add(otherId);

      let newX: number;
      let newY: number;

      const isParentOfOther = rel.type === "padre_hijx" || rel.type === "madre_hijx";
      const otherIsParent = isParentOfOther && rel.second_person_id === id;
      const otherIsChild = isParentOfOther && rel.first_person_id === id;

      if (rel.type === "compañerxs") {
        newX = x + X_GAP;
        newY = y;
      } else if (otherIsParent) {
        newX = x + (parentIndex - 0.5) * X_GAP;
        newY = y - Y_GAP;
        parentIndex++;
      } else {
        newX = x + (childIndex - 1) * X_GAP;
        newY = y + Y_GAP;
        childIndex++;
      }

      queue.push({ id: otherId, x: newX, y: newY, generation: generation + 1 });

      edges.push({
        id: rel.id,
        source: otherIsParent ? otherId : id,
        target: otherIsParent ? id : otherId,
        style: rel.type === "compañerxs"
          ? { stroke: "#1F3350", strokeWidth: 2 }
          : { stroke: "#3D362B", strokeWidth: 2 },
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
  } | null>(null);

  const flowRef = useRef<HTMLDivElement>(null);
  const { flowToScreenPosition } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildTree(persons, relations, rootId, generations);
    return { initialNodes: nodes, initialEdges: edges };
  }, [persons, relations, rootId, generations]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

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
    (option: RelationOption) => {
      if (!contextMenu) return;
      const person = persons.find((p) => p.id === contextMenu.nodeId);
      if (!person) return;
      setPanel({
        relationType: option,
        personId: contextMenu.nodeId,
        personName: getFullLabel(person),
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
        relationType: panel.relationType,
        relatedPersonId: panel.personId,
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
