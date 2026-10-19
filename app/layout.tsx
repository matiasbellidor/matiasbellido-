import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ModalProvider } from "@/context/ModalContext";
import { Inter } from "next/font/google";
import "./globals.css";

/* Única fuente del sitio (también la de los títulos, ver tailwind.config.ts) */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Matías Bellido — Actuario & Data Analyst",
  description: "Portfolio profesional de Matías Bellido. Actuario, Data Analyst y emprendedor enfocado en soluciones digitales y gestión estratégica.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Matías Bellido — Actuario & Data Analyst",
    description: "Portfolio profesional de Matías Bellido. Actuario, Data Analyst y emprendedor enfocado en soluciones digitales y gestión estratégica.",
    url: "https://portfoliobellido.vercel.app",
    siteName: "Portfolio Bellido",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matías Bellido — Actuario & Data Analyst",
    description: "Portfolio profesional de Matías Bellido.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        {/* Antes del primer paint:
            - tema guardado (sin flash claro→oscuro; también aplica en /cv)
            - si la intro ya se vio en esta sesión, marcamos el <html>
              para que el loader no aparezca ni un frame.
              Para volver a verla: abrir la URL con ?intro (ej. /?intro). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;if(localStorage.getItem("theme")!=="light")d.classList.add("dark");if(sessionStorage.getItem("intro-seen")&&!/[?&]intro\\b/.test(location.search))d.classList.add("intro-seen")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-[var(--bg)] text-[var(--fg)] transition-colors`}>
        <LanguageProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
} 