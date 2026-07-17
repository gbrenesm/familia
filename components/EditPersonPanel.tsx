"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePerson, createEvent, updateEvent, deleteEvent, createDocument, deleteDocument, toggleCompleted, deletePerson } from "@/app/arbol-familiar/[id]/actions";
import DocumentUploader from "./DocumentUploader";
import type { Event } from "@/types/event";
import type { Document } from "@/types/document";

type Props = {
  person: {
    id: string;
    name: string | null;
    first_lastname: string;
    second_lastname: string | null;
    gender: "mujer" | "hombre" | "no encontrado";
    completed: boolean;
  };
  events: Event[];
  documents: Document[];
  onClose: () => void;
};

const eventTypes = [
  "nacimiento",
  "matrimonio",
  "bautizo",
  "graduación",
  "adopción",
  "migración",
  "defunción",
  "otro",
];

export default function EditPersonPanel({ person, events, documents, onClose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"datos" | "evento">("datos");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [name, setName] = useState(person.name || "");
  const [firstLastname, setFirstLastname] = useState(person.first_lastname);
  const [secondLastname, setSecondLastname] = useState(person.second_lastname || "");
  const [gender, setGender] = useState(person.gender);

  const [eventType, setEventType] = useState("nacimiento");
  const [eventDate, setEventDate] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [eventState, setEventState] = useState("");
  const [eventCountry, setEventCountry] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [docUrl, setDocUrl] = useState("");
  const [showDocInput, setShowDocInput] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventType, setEditEventType] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventPlace, setEditEventPlace] = useState("");
  const [editEventState, setEditEventState] = useState("");
  const [editEventCountry, setEditEventCountry] = useState("");
  const [editEventDescription, setEditEventDescription] = useState("");

  const handleSavePerson = async () => {
    await updatePerson({
      id: person.id,
      name,
      first_lastname: firstLastname,
      second_lastname: secondLastname,
      gender,
    });
    router.refresh();
    onClose();
  };

  const handleSaveEvent = async () => {
    const result = await createEvent({
      personId: person.id,
      type: eventType,
      date: eventDate,
      place: eventPlace,
      state: eventState,
      country: eventCountry,
      description: eventDescription,
    });
    router.refresh();
    setSelectedEventId(result.id);
    setEventType("nacimiento");
    setEventDate("");
    setEventPlace("");
    setEventState("");
    setEventCountry("");
    setEventDescription("");
  };

  const handleStartEditEvent = (evt: Event) => {
    setEditingEventId(evt.id);
    setEditEventType(evt.type);
    setEditEventDate(evt.date || "");
    setEditEventPlace(evt.place || "");
    setEditEventState(evt.state || "");
    setEditEventCountry(evt.country || "");
    setEditEventDescription(evt.description || "");
  };

  const handleSaveEditEvent = async () => {
    if (!editingEventId) return;
    await updateEvent({
      id: editingEventId,
      type: editEventType,
      date: editEventDate,
      place: editEventPlace,
      state: editEventState,
      country: editEventCountry,
      description: editEventDescription,
    });
    setEditingEventId(null);
    router.refresh();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    if (selectedEventId === eventId) setSelectedEventId(null);
    if (editingEventId === eventId) setEditingEventId(null);
    router.refresh();
  };

  const handleAddDocument = async () => {
    if (!selectedEventId || !docUrl) return;
    await createDocument({
      personId: person.id,
      eventId: selectedEventId,
      url: docUrl,
    });
    setDocUrl("");
    setShowDocInput(false);
    router.refresh();
  };

  const handleDeleteDocument = async (docId: string) => {
    await deleteDocument(docId);
    router.refresh();
  };

  const handleDeletePerson = async () => {
    await deletePerson(person.id);
    router.push("/");
  };

  const eventDocs = selectedEventId
    ? documents.filter((d) => d.event_id === selectedEventId)
    : [];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 520,
        height: "100vh",
        backgroundColor: "#F1E6CC",
        borderLeft: "1px solid #B8A576",
        boxShadow: "-4px 0 24px rgba(61,54,43,0.12)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #B8A576" }}>
        <button onClick={() => setTab("datos")} style={tabStyle(tab === "datos")}>
          Datos básicos
        </button>
        <button onClick={() => setTab("evento")} style={tabStyle(tab === "evento")}>
          Eventos
        </button>
      </div>

      <div style={{ padding: 28, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ============ TAB DATOS ============ */}
        {tab === "datos" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Primer Apellido</label>
                <input type="text" value={firstLastname} onChange={(e) => setFirstLastname(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Segundo Apellido</label>
                <input type="text" value={secondLastname} onChange={(e) => setSecondLastname(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Género</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {(["mujer", "hombre", "no encontrado"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    style={{
                      ...pillStyle,
                      backgroundColor: gender === g ? "#1F3350" : "#fff",
                      color: gender === g ? "#F1E6CC" : "#3D362B",
                      borderColor: gender === g ? "#1F3350" : "#B8A576",
                    }}
                  >
                    {g === "no encontrado" ? "No encontrado" : g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 24 }}>
              <button onClick={onClose} style={cancelButtonStyle}>Cancelar</button>
              <button onClick={handleSavePerson} style={saveButtonStyle}>Guardar cambios</button>
            </div>

            <div style={{ borderTop: "1px solid #B8A576", marginTop: 32, paddingTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={async () => {
                  await toggleCompleted(person.id, !person.completed);
                  router.refresh();
                  onClose();
                }}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor: person.completed ? "transparent" : "#6B7A4A",
                  border: person.completed ? "1px solid #6B7A4A" : "none",
                  borderRadius: 8,
                  color: person.completed ? "#6B7A4A" : "#F1E6CC",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {person.completed ? "Desmarcar investigación completada" : "Investigación completada"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor: "transparent",
                  border: "1px solid #9E3A32",
                  borderRadius: 8,
                  color: "#9E3A32",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Eliminar persona
              </button>
            </div>

            {showDeleteConfirm && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(61,54,43,0.5)",
                  zIndex: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "#F1E6CC",
                    border: "1px solid #B8A576",
                    borderRadius: 12,
                    padding: 32,
                    maxWidth: 380,
                    width: "90%",
                    boxShadow: "0 8px 32px rgba(61,54,43,0.2)",
                  }}
                >
                  <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: "#1F3350" }}>
                    ¿Eliminar persona?
                  </h3>
                  <p style={{ margin: "0 0 24px", fontSize: 13, lineHeight: 1.6, color: "#3D362B" }}>
                    Se eliminarán todos los eventos, documentos y relaciones asociadas a esta persona. Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowDeleteConfirm(false)} style={cancelButtonStyle}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeletePerson}
                      style={{
                        padding: "10px 24px",
                        backgroundColor: "#9E3A32",
                        border: "none",
                        borderRadius: 8,
                        color: "#F1E6CC",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ TAB EVENTOS ============ */}
        {tab === "evento" && (
          <>
            {/* Existing events as fichas */}
            {events.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Eventos registrados</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventId(selectedEventId === evt.id ? null : evt.id)}
                      style={{
                        border: selectedEventId === evt.id ? "2px solid #1F3350" : "1px solid #B8A576",
                        borderRadius: 8,
                        padding: 16,
                        backgroundColor: "#F1E6CC",
                        cursor: "pointer",
                      }}
                    >
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#C1653A", display: "inline-block" }} />
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#6B5D45", textTransform: "uppercase" }}>
                            {evt.type}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartEditEvent(evt); }}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              border: "1px solid #1F3350",
                              backgroundColor: "transparent",
                              color: "#1F3350",
                              fontSize: 11,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              border: "1px solid #9E3A32",
                              backgroundColor: "transparent",
                              color: "#9E3A32",
                              fontSize: 11,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Edit form */}
                      {editingEventId === evt.id ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}>
                          <div style={{ marginBottom: 10 }}>
                            <label style={labelStyle}>Tipo</label>
                            <select value={editEventType} onChange={(e) => setEditEventType(e.target.value)} style={inputStyle}>
                              {eventTypes.map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <label style={labelStyle}>Fecha</label>
                            <input type="text" value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)} style={inputStyle} />
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <label style={labelStyle}>Lugar</label>
                            <input type="text" value={editEventPlace} onChange={(e) => setEditEventPlace(e.target.value)} style={inputStyle} />
                          </div>
                          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                            <div style={{ flex: 1 }}>
                              <label style={labelStyle}>Estado</label>
                              <input type="text" value={editEventState} onChange={(e) => setEditEventState(e.target.value)} style={inputStyle} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={labelStyle}>País</label>
                              <input type="text" value={editEventCountry} onChange={(e) => setEditEventCountry(e.target.value)} style={inputStyle} />
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <label style={labelStyle}>Descripción</label>
                            <textarea value={editEventDescription} onChange={(e) => setEditEventDescription(e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setEditingEventId(null)} style={{ ...cancelButtonStyle, fontSize: 12, padding: "6px 12px" }}>Cancelar</button>
                            <button onClick={handleSaveEditEvent} style={{ ...saveButtonStyle, fontSize: 12, padding: "6px 16px" }}>Guardar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Date */}
                          {evt.date && (
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#3D362B", marginBottom: 4 }}>
                              {evt.date}
                            </div>
                          )}

                          {/* Place */}
                          {(evt.place || evt.state || evt.country) && (
                            <div style={{ fontSize: 12, color: "#6B5D45" }}>
                              {[evt.place, evt.state, evt.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </>
                      )}

                      {/* Expanded: documents */}
                      {selectedEventId === evt.id && (
                        <div style={{ borderTop: "1px solid #B8A576", paddingTop: 12, marginTop: 10 }}>
                          <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#6B5D45", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                            Documentos relacionados
                          </label>

                          {eventDocs.map((doc) => (
                            <div
                              key={doc.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 10px",
                                backgroundColor: "#E9DBB8",
                                borderRadius: 6,
                                border: "1px solid #B8A576",
                                marginBottom: 6,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F3350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span style={{ fontSize: 11, color: "#3D362B" }}>
                                  {doc.url.split("/").pop() || doc.url}
                                </span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                style={{ background: "none", border: "none", color: "#9E3A32", cursor: "pointer", fontSize: 13 }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          {/* Add document input */}
                          {showDocInput && (
                            <div style={{ marginBottom: 6 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                placeholder="URL del documento"
                                value={docUrl}
                                onChange={(e) => setDocUrl(e.target.value)}
                                style={{ ...inputStyle, fontSize: 12, padding: "8px 10px", marginBottom: 6 }}
                              />
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => { setShowDocInput(false); setDocUrl(""); }} style={{ ...cancelButtonStyle, fontSize: 11, padding: "4px 8px" }}>
                                  Cancelar
                                </button>
                                <button onClick={handleAddDocument} style={{ ...saveButtonStyle, fontSize: 11, padding: "4px 12px" }}>
                                  Guardar
                                </button>
                              </div>
                            </div>
                          )}

                          {showUploader && (
                            <DocumentUploader
                              onUploadComplete={async (url, fileName, source) => {
                                await createDocument({
                                  personId: person.id,
                                  eventId: selectedEventId!,
                                  url,
                                  name: fileName,
                                  source: source || undefined,
                                });
                                setShowUploader(false);
                                router.refresh();
                              }}
                              onCancel={() => setShowUploader(false)}
                            />
                          )}

                          {!showDocInput && !showUploader && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDocInput(true); }}
                                style={dashedButtonStyle}
                              >
                                + Relacionar documento existente
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowUploader(true); }}
                                style={dashedButtonStyle}
                              >
                                + Subir nuevo documento
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: "1px solid #B8A576", marginBottom: 20 }} />

            {/* New event form */}
            <div style={{ border: "1px solid #B8A576", borderRadius: 8, padding: 20 }}>
              <label style={{ ...labelStyle, fontSize: 12, marginBottom: 16, color: "#1F3350" }}>Agregar evento</label>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tipo de evento</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {eventTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setEventType(t)}
                      style={{
                        ...pillStyle,
                        padding: "6px 12px",
                        fontSize: 12,
                        backgroundColor: eventType === t ? "#6B7A4A" : "#fff",
                        color: eventType === t ? "#F1E6CC" : "#3D362B",
                        borderColor: eventType === t ? "#6B7A4A" : "#B8A576",
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Fecha</label>
                <input
                  type="text"
                  placeholder="14 de marzo, 1932"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={inputStyle}
                />
                <span style={{ fontSize: 10, color: "#6B5D45", marginTop: 4, display: "block", lineHeight: 1.4 }}>
                  Admite fechas aproximadas: &quot;circa 1932&quot;, &quot;marzo 1958&quot;, &quot;década de 1970&quot;
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Lugar</label>
                <input
                  type="text"
                  placeholder="Oaxaca de Juárez"
                  value={eventPlace}
                  onChange={(e) => setEventPlace(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Estado</label>
                  <input type="text" placeholder="Oaxaca" value={eventState} onChange={(e) => setEventState(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>País</label>
                  <input type="text" placeholder="México" value={eventCountry} onChange={(e) => setEventCountry(e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  placeholder="Notas adicionales sobre el evento..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={onClose} style={cancelButtonStyle}>Cancelar</button>
                <button onClick={handleSaveEvent} style={saveButtonStyle}>Guardar evento</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "14px 16px",
    backgroundColor: active ? "#F1E6CC" : "#E9DBB8",
    border: "none",
    borderBottom: active ? "2px solid #1F3350" : "2px solid transparent",
    color: active ? "#1F3350" : "#6B5D45",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}

const dashedButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  backgroundColor: "transparent",
  border: "1px dashed #B8A576",
  borderRadius: 6,
  color: "#6B5D45",
  fontSize: 11,
  cursor: "pointer",
  textAlign: "center",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: 1,
  color: "#6B5D45",
  textTransform: "uppercase",
  marginBottom: 6,
  fontFamily: "var(--font-jetbrains), monospace",
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
  fontFamily: "var(--font-lora), Georgia, serif",
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
  backgroundColor: "#1F3350",
  border: "none",
  borderRadius: 8,
  color: "#F1E6CC",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(31,51,80,0.3)",
};
