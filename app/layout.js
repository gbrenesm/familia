import { Playfair_Display, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Árbol Familiar",
  description: "Árbol genealógico familiar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${playfair.variable} ${lora.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
