"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Languages, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";

export default function Header() {
  const { t, lang, setLang } = useLanguage();
  const { isModalOpen } = useModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isDark, setIsDark] = useState(true);
  // Flag para ignorar scroll spy mientras hacemos scroll programático (al click)
  const ignoreScrollSpy = useRef(false);

  // ORDEN CORRECTO: Inicio → Habilidades → Proyectos → Experiencia → Contacto
  const navItems = [
    { href: "#home", label: t.nav.home, id: "home" },
    { href: "#skills", label: t.nav.skills, id: "skills" },
    { href: "#projects", label: t.nav.projects, id: "projects" },
    { href: "#experience", label: t.nav.experience, id: "experience" },
    { href: "#contact", label: t.nav.contact, id: "contact" },
  ];

  // Theme toggle
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved !== "light";
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Scroll spy MEJORADO - elige la sección que ocupa más viewport
  useEffect(() => {
    const handleScroll = () => {
      if (ignoreScrollSpy.current) return;

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenter = scrollY + viewportHeight / 2;

      // Si estamos cerca del tope absoluto, siempre Home
      if (scrollY < 100) {
        setActiveSection("home");
        return;
      }

      // Si estamos cerca del fondo absoluto, siempre Contact
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollY + viewportHeight >= documentHeight - 50) {
        setActiveSection("contact");
        return;
      }

      // Para todo el medio: la sección activa es aquella cuyo CENTRO
      // está más cerca del centro del viewport
      let bestSection = "home";
      let smallestDistance = Infinity;

      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const elementTop = scrollY + rect.top;
        const elementCenter = elementTop + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          bestSection = item.id;
        }
      }

      setActiveSection(bestSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando hacés click en un nav link, fijamos la sección activa inmediatamente
  // y deshabilitamos el scroll spy por un momento para evitar flicker
  const handleNavClick = (id: string) => {
    setActiveSection(id);
    ignoreScrollSpy.current = true;
    setTimeout(() => { ignoreScrollSpy.current = false; }, 800);
  };

  const handleLangToggle = () => setLang(lang === "es" ? "en" : "es");

  return (
    <AnimatePresence>
      {!isModalOpen && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="glass-nav rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between">
              {/* Logo */}
              <Link href="#home" onClick={() => handleNavClick("home")} className="font-display text-xl font-bold text-cyan tracking-tight">
                MB.
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                      activeSection === item.id
                        ? "text-cyan"
                        : "text-fg-soft hover:text-cyan"
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLangToggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-cyan/10 transition-colors touch-manipulation"
                  aria-label="Toggle language"
                >
                  <Languages className="w-4 h-4 text-cyan" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={lang}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs uppercase font-mono text-fg-soft"
                    >
                      {lang}
                    </motion.span>
                  </AnimatePresence>
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-cyan/10 transition-colors touch-manipulation"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait">
                    {isDark ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-4 h-4 text-cyan" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-4 h-4 text-cyan" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-full hover:bg-cyan/10 transition-colors touch-manipulation"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-cyan" /> : <Menu className="w-5 h-5 text-cyan" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden mt-2 glass-nav rounded-2xl p-4 flex flex-col gap-1"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setMobileMenuOpen(false); handleNavClick(item.id); }}
                      className={`px-4 py-3 rounded-full text-sm font-medium transition-all ${
                        activeSection === item.id ? "bg-cyan/10 text-cyan" : "text-fg-soft hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}