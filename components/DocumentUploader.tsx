"use client";

import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";

type Props = {
  onUploadComplete: (url: string, fileName: string, source: string) => void;
  onCancel: () => void;
};

export default function DocumentUploader({ onUploadComplete, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setUploadedUrl(res[0].ufsUrl);
        setFileName(res[0].name);
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      setError(err.message);
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setUploading(true);
    await startUpload([file]);
  };

  const handleSave = () => {
    if (uploadedUrl && fileName) {
      const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");
      onUploadComplete(uploadedUrl, nameWithoutExt, source);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: 6 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {!uploadedUrl && !uploading && (
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            padding: "12px 10px",
            backgroundColor: "#E9DBB8",
            border: "1px dashed #B8A576",
            borderRadius: 6,
            color: "#3D362B",
            fontSize: 12,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Seleccionar archivo (PDF o imagen)
        </button>
      )}

      {uploading && (
        <div
          style={{
            padding: "12px 10px",
            backgroundColor: "#E9DBB8",
            border: "1px solid #B8A576",
            borderRadius: 6,
            fontSize: 12,
            color: "#6B5D45",
            textAlign: "center",
          }}
        >
          Subiendo {fileName}...
        </div>
      )}

      {uploadedUrl && (
        <div>
          <div
            style={{
              padding: "8px 10px",
              backgroundColor: "#E9DBB8",
              border: "1px solid #6B7A4A",
              borderRadius: 6,
              fontSize: 11,
              color: "#6B7A4A",
              marginBottom: 8,
            }}
          >
            ✓ {fileName}
          </div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 1,
              color: "#6B5D45",
              textTransform: "uppercase",
              marginBottom: 4,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Fuente
          </label>
          <input
            type="text"
            placeholder="Ej. Archivo General de la Nación"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #B8A576",
              backgroundColor: "#E9DBB8",
              fontSize: 12,
              color: "#3D362B",
              outline: "none",
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} style={{ background: "none", border: "none", color: "#6B5D45", fontSize: 11, cursor: "pointer" }}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "6px 14px",
                backgroundColor: "#1F3350",
                border: "none",
                borderRadius: 6,
                color: "#F1E6CC",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Guardar documento
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: "#9E3A32", marginTop: 4 }}>
          Error: {error}
        </div>
      )}

      {!uploadedUrl && !uploading && null}
      {!uploadedUrl && uploading && null}
      {!uploadedUrl && !uploading && (
        <button
          onClick={onCancel}
          style={{
            marginTop: 6,
            background: "none",
            border: "none",
            color: "#6B5D45",
            fontSize: 11,
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
