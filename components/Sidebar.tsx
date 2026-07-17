"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function TreeIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M5 10l7-7 7 7" />
      <path d="M3 16l9-6 9 6" />
    </svg>
  );
}

function TimelineIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="18" r="2" />
      <line x1="14" y1="6" x2="20" y2="6" />
      <line x1="14" y1="12" x2="20" y2="12" />
      <line x1="14" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function PeopleIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Árbol", Icon: TreeIcon },
  { href: "/linea-de-tiempo", label: "Línea de tiempo", Icon: TimelineIcon },
  { href: "/personas", label: "Personas", Icon: PeopleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        backgroundColor: "#E9DBB8",
        borderRight: "1px solid #B8A576",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#1F3350",
          margin: "0 0 24px 8px",
          fontFamily: "var(--font-playfair), Georgia, serif",
        }}
      >
        Árbol Familiar
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const color = isActive ? "#F1E6CC" : "#3D362B";
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                backgroundColor: isActive ? "#1F3350" : "transparent",
                color: isActive ? "#F1E6CC" : "#3D362B",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s",
                fontFamily: "var(--font-lora), Georgia, serif",
              }}
            >
              <item.Icon color={color} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
