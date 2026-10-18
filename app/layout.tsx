import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ModalProvider } from "@/context/ModalContext";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Matías Bellido — Actuario & Data Scientist",
  description: "Portfolio profesional de Matías Bellido. Actuario, Data Scientist, y emprendedor enfocado en soluciones digitales y gestión estratégica.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Matías Bellido — Actuario & Data Scientist",
    description: "Portfolio profesional de Matías Bellido. Actuario, Data Scientist, y emprendedor enfocado en soluciones digitales y gestión estratégica.",
    url: "https://portfoliobellido.vercel.app",
    siteName: "Portfolio Bellido",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matías Bellido — Actuario & Data Scientist",
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
              para que el loader no aparezca ni un frame. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;if(localStorage.getItem("theme")!=="light")d.classList.add("dark");if(sessionStorage.getItem("intro-seen"))d.classList.add("intro-seen")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans bg-[var(--bg)] text-[var(--fg)] transition-colors`}>
        <LanguageProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
} 