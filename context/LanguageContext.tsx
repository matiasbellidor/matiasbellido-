"use client";

/* ============================================================================
   ARCHIVO DE CONTENIDO DEL PORTFOLIO
   ============================================================================

   ESTE ES EL UNICO ARCHIVO QUE TENES QUE EDITAR PARA CAMBIAR TEXTOS.

   Estructura:
   - translations.es = todo el contenido en español
   - translations.en = todo el contenido en inglés

   IMPORTANTE: Si modificás un texto en español, también debés modificar
   el equivalente en inglés (más abajo en el archivo) para que la traducción
   funcione correctamente.
   ============================================================================ */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "es" | "en";

type ProjectItem = {
  date: string;
  category: string;
  title: string;
  role?: string;
  /** Chip debajo del título, con el mismo estilo que `role` (ej. la hackathon donde se hizo) */
  badge?: string;
  desc: string;
  tags: string[];
  links?: { github?: string; review?: string; demo?: string };
};

type ExperienceItem = {
  period: string;
  role: string;
  company: string;
  type: string;
  desc: string;
  tags: string[];
};

type EducationItem = {
  period: string;
  institution: string;
  degree: string;
  desc: string;
  descBullets?: string[];
  /** Texto del enlace de la tarjeta; si falta, "Click para leer más →" */
  clickHint?: string;
  longDesc: string;
};

/* ── Landing de /fitness (Bellido Asesoramientos) ──
   Contenido tomado del PDF de la propuesta (public/projects/Imagenes/
   Bellido-Asesoramientos-Fitness.pdf). Lo que el PDF no trae (precios,
   datos de clientes) queda vacío y la página muestra un texto de respaldo. */
type FitnessPlan = {
  /** Identificador estable para el carrito (no cambiar aunque cambie el nombre) */
  id: string;
  name: string;
  /** La diferencia principal del plan, en una línea (se muestra destacada) */
  highlight: string;
  /** Lo que incluye (contenido del PDF, con palabras claras) */
  items: string[];
  /** Precio en pesos argentinos, sin decimales. null → se muestra plans.priceFallback y no va al carrito */
  price: number | null;
};

/* Textos del carrito y del pago con Mercado Pago (ver components/fitness/FitnessCart.tsx) */
type FitnessCartDict = {
  add: string;
  inCart: string;
  open: string;
  title: string;
  close: string;
  steps: string[];
  empty: string;
  emptyCta: string;
  remove: string;
  less: string;
  more: string;
  total: string;
  monthNote: string;
  toPay: string;
  payTitle: string;
  payIntro: string;
  payButton: string;
  qrLabel: string;
  aliasLabel: string;
  cvuLabel: string;
  nameLabel: string;
  copy: string;
  copied: string;
  paid: string;
  back: string;
  doneTitle: string;
  doneDesc: string;
  formButton: string;
  formPending: string;
  receipt: string;
  /** {items}, {total} y {extras} se reemplazan; va precargado en WhatsApp */
  receiptMessage: string;
  finish: string;
  /* Código de descuento y quién recomendó (se cargan en la sección Afiliados).
     El código se resta solo; el porcentaje no se muestra en ningún texto. */
  codeLabel: string;
  referrerLabel: string;
  removeExtra: string;
  subtotal: string;
  discount: string;
  /** Marca de los planes y packs con descuento (lo mensual: el descuento va en el primer mes) */
  discountChip: string;
  /** Marca de las clases presenciales e infoproductos con descuento */
  discountChipOnce: string;
  /** Para lectores de pantalla: el precio tachado y el precio final de cada línea */
  originalPrice: string;
  finalPrice: string;
  /** Se suman al mensaje del comprobante. Empiezan con un espacio. {code} / {name} */
  extrasCode: string;
  extrasReferrer: string;
  units: { month: string; once: string };
};

type FitnessDict = {
  /** Mensaje precargado de los botones generales de WhatsApp */
  whatsappMessage: string;
  nav: {
    links: { id: string; label: string }[];
    cta: string;
    menu: string;
    close: string;
    home: string;
    /** aria-label del botón de idioma: dice a qué idioma cambia */
    lang: string;
    /** El otro idioma, en ese idioma: la opción del menú en el celular */
    langOther: string;
  };
  hero: {
    tagline: string;
    who: string;
    /** El método en tres chips */
    method: string[];
    cta: string;
    ctaSecondary: string;
    photoAlt: string;
    /** Las tres palabras del chip sobre la foto */
    loop: string[];
  };
  audience: {
    eyebrow: string;
    title: string;
    whoTitle: string;
    who: string[];
    problemsTitle: string;
    problems: { title: string; desc: string }[];
    closing: string;
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    photoAlt: string;
    facts: { label: string; value: string }[];
    certsTitle: string;
    /** Textuales, "Entidad — Título". No agregar otras. Las que tienen archivo en public/fitness/Certificados se pueden abrir. */
    certs: string[];
    /** Texto chico de las certificaciones que se pueden abrir */
    certView: string;
    /** Para lectores de pantalla, en las que son PDF */
    certNewTab: string;
    certClose: string;
    /** Va antes del nombre en el texto alternativo de la imagen */
    certAlt: string;
    /** El visor de una certificación que todavía no tiene archivo (pedido de Matías): "Error 404", título y bajada */
    certMissing: string;
    certMissingTitle: string;
    certMissingDesc: string;
  };
  start: {
    eyebrow: string;
    title: string;
    intro: string;
    freeCall: string;
    stepLabel: string;
    steps: { title: string; desc: string; when: string }[];
    cta: string;
  };
  method: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { title: string; desc: string }[];
    sheet: {
      label: string;
      note: string;
      columns: string[];
      rows: { exercise: string; values: string[] }[];
    };
  };
  assimilation: {
    eyebrow: string;
    title: string;
    intro: string;
    monthLabel: string;
    months: string[];
  };
  results: {
    eyebrow: string;
    title: string;
    intro: string;
    before: string;
    after: string;
    clientLabel: string;
    pending: string;
    /** Una por cliente, en el mismo orden que las fotos (client-01, client-02…). Vacía → no se muestra */
    captions: string[];
    disclaimer: string;
    /** Cómo se usa el comparador (en tamaño de texto, no como etiqueta chica) */
    hint: string;
    /** Nombre del control para lectores de pantalla ("Cliente 01: …") */
    compare: string;
    /** El carrusel que se mueve solo: nombre para lectores de pantalla y botón de pausa */
    carouselLabel: string;
    pause: string;
    play: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    intro: string;
    groups: { title: string; items: { q: string; a: string }[] }[];
  };
  plans: {
    eyebrow: string;
    title: string;
    intro: string;
    tabsLabel: string;
    priceFallback: string;
    billing: string;
    includes: string;
    cta: string;
    /** {plan} se reemplaza por el nombre del plan */
    message: string;
    /** label = nombre corto de la pestaña; sublabel = en qué se diferencia (en la pestaña) */
    groups: { id: string; label: string; sublabel: string; desc: string; plans: FitnessPlan[] }[];
    /** Clases presenciales: se compran por unidad (el carrito deja elegir cuántas) */
    inPerson: { id: string; title: string; desc: string; price: number; unit: string; cta: string; message: string };
  };
  infoproducts: {
    eyebrow: string;
    title: string;
    intro: string;
    unit: string;
    items: { id: string; title: string; price: number; items: string[] }[];
  };
  cart: FitnessCartDict;
  affiliates: {
    eyebrow: string;
    title: string;
    intro: string;
    firstValue: string;
    firstLabel: string;
    afterValue: string;
    afterLabel: string;
    payout: string;
    example: string;
    cta: string;
    message: string;
    /** Dos bloques chicos: código de descuento y quién te recomendó. Quedan en el carrito. */
    referral: {
      code: { title: string; desc: string; label: string; placeholder: string; applied: string; invalid: string };
      referrer: { title: string; desc: string; label: string; placeholder: string };
      save: string;
      saved: string;
      clear: string;
    };
  };
  contact: {
    title: string;
    desc: string;
    cta: string;
    freeCall: string;
    /** Nombre del botón de email para lectores de pantalla (el visible es la dirección) */
    emailLabel: string;
    email: string;
  };
  /** withdrawal = "Botón de arrepentimiento" (Res. 424/2020, obligatorio en ventas online en Argentina) */
  footer: { back: string; health: string; rights: string; withdrawal: string; withdrawalMessage: string };
};

type Dict = {
  nav: {
    home: string;
    skills: string;
    experience: string;
    projects: string;
    contact: string;
  };
  hero: {
    badge: string;
    location: string;
    /** Versión corta para el badge del Hero en pantallas de menos de 1280px */
    locationShort: string;
    titleLine1: string;
    titleLine2: string;
    desc: string;
    ctaProjects: string;
    ctaAbout: string;
  };
  bio: {
    eyebrow: string;
    title: string;
    categories: {
      data: string;
      ai: string;
      dev: string;
      prof: string;
    };
    englishSkill: string;
    manifesto: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    experienceTitle: string;
    educationTitle: string;
    coursesTitle: string;
    courses: { category: string; items: string[] }[];
    items: ExperienceItem[];
    education: EducationItem[];
  };
  projects: {
    eyebrow: string;
    title: string;
    digitalSubtitle: string;
    businessSubtitle: string;
    agrocow: ProjectItem;
    symbiosis: ProjectItem & { comingSoonLabel: string; clickHint: string };
    zira: ProjectItem;
    oneiric: ProjectItem;
    nexstock: ProjectItem;
    budgents: ProjectItem;
    nutriops: ProjectItem;
    imports: ProjectItem;
    asesoramientos: ProjectItem;
    modal: {
      title: string;
      desc: string;
      placeholder: string;
      button: string;
    };
  };
  footer: {
    eyebrow: string;
    title: string;
    desc: string;
    emailLabel: string;
    locationLabel: string;
    location: string;
    role: string;
    tagline: string;
    rights: string;
    form: {
      providerLabel: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submit: string;
      hint: string;
      opened: string;
      subject: string;
      greeting: string;
      emailLine: string;
    };
  };
  fitness: FitnessDict;
};

export const translations: Record<Lang, Dict> = {
  // ==========================================================================
  // ESPAÑOL
  // ==========================================================================
  es: {
    nav: {
      home: "Inicio",
      skills: "Habilidades",
      projects: "Proyectos",
      experience: "Experiencia",
      contact: "Contacto",
    },
    hero: {
      badge: "Actuario & Data Analyst",
      location: "CABA, Argentina",
      locationShort: "CABA",
      titleLine1: "Hola! Soy",
      titleLine2: "Matías Bellido",
      // Lo que va entre **dobles asteriscos** se resalta con el color de acento.
      // ⁠ (unión invisible) evita que "FCE-UBA" se corte en el guion; el guion
      // no separable (‑) no sirve porque Inter no lo trae.
      desc: "Estudiante de **Actuario** (FCE-⁠UBA), con foco en **Data Analysis** e IA aplicada. Construyo soluciones que convierten datos complejos en decisiones claras.",
      ctaProjects: "Ver Proyectos",
      ctaAbout: "Sobre mí",
    },
    bio: {
      eyebrow: "Matías Rodrigo Bellido",
      title: "Habilidades",
      categories: {
        data: "Data & Analytics",
        ai: "AI & Automation",
        dev: "Development & Tools",
        prof: "Professional",
      },
      englishSkill: "Inglés C1",
      manifesto:
        "Decidí estudiar Actuario por varias razones. Una es el desafío de cursar una carrera exigente como Ciencias Actuariales; otra, la posibilidad de aprender a usar y comprender herramientas estadísticas que me sirvan para cualquier proyecto que emprenda. La mirada analítica que me aporta la carrera es algo que agradezco.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experiencia & Educación",
      experienceTitle: "Experiencia",
      educationTitle: "Educación",
      coursesTitle: "Formación Complementaria",
      items: [
        {
          period: "Abr 2024 - Actualidad",
          role: "Tutor Académico Particular",
          company: "Freelance - Autónomo",
          type: "Matemática & Estadística",
          desc: "Coordino un staff de docentes que cubre demanda en niveles primario, secundario y universitario. Dicto clases avanzadas de Análisis Matemático, Álgebra Lineal y Estadística Descriptiva (UBA CBC y Primer Año), traduciendo conceptos abstractos al ritmo de cada alumno.",
          tags: ["Liderazgo", "Docencia", "Gestión de equipo"],
        },
        {
          period: "Jun 2023 - Actualidad",
          role: "Personal Trainer & Wellness Coach",
          company: "Freelance - Autónomo",
          type: "Híbrido",
          desc: "Gestión integral de cartera de clientes con planificación basada en datos. Diseño mesociclos ajustando volumen e intensidad según KPIs físicos semanales. Establezco métricas claras y monitoreo evolución para garantizar adherencia y resultados.",
          tags: ["KPIs", "Planificación estratégica", "Retención"],
        },
        {
          period: "Dic 2024 - Nov 2025",
          role: "Customer Experience",
          company: "Arcos Dorados",
          type: "Jornada parcial - Presencial",
          desc: "Experiencia laboral intensiva en un entorno corporativo de altos estándares operativos. Ejecución precisa de procesos estandarizados bajo métricas de tiempo y eficiencia, resolución de problemas en momentos de alta demanda y coordinación constante con el staff.",
          tags: ["Operaciones", "Trabajo en equipo", "Alta presión"],
        },
        {
          period: "Ago 2024 - Dic 2024",
          role: "Gerente de Desarrollo de Negocio",
          company: "SomeClub",
          type: "Jornada parcial - Híbrido",
          desc: "Rol enfocado en prospección estratégica y calificación de leads para el equipo de ventas. Administración y actualización de bases de datos en CRM, análisis de funnels (tasa de respuesta, agendamiento) y comunicación B2B/B2C identificando puntos de dolor en clientes potenciales.",
          tags: ["CRM", "Análisis de funnels", "B2B/B2C"],
        },
        {
          period: "Feb 2024 - Ago 2024",
          role: "Consultor Comercial",
          company: "FIAT Argentina",
          type: "Jornada completa - Presencial",
          desc: "Gestión integral del ciclo de ventas y asesoramiento comercial en el sector automotriz, enfocado en cumplimiento de objetivos mensuales y satisfacción del cliente. Cierre mediante técnicas de negociación consultiva y manejo de objeciones.",
          tags: ["Negociación", "Sales", "KPIs comerciales"],
        },
        {
          period: "Ago 2023 - Dic 2023",
          role: "Asistente de Investigación (Pasante)",
          company: "Fundación Apolo",
          type: "Contrato de prácticas - Presencial",
          desc: "Participación en el programa ACAP del Gobierno de la Ciudad. Colaboración en proyectos de transparencia institucional y políticas públicas: búsqueda y síntesis de fuentes, soporte en organización de documentos y redacción de resúmenes ejecutivos.",
          tags: ["Investigación", "Políticas públicas", "Research"],
        },
      ],
      education: [
        {
          period: "Abr 2024 - Oct 2028",
          institution: "Universidad de Buenos Aires",
          degree: "Actuario - Actuarial Science",
          desc: "Foco académico en Métodos Cuantitativos, Estadística Matemática y Macroeconomía. Investigación independiente en Data Science y aplicación de algoritmos (Python/R) a modelos actuariales.",
          descBullets: [
            "Matemática Aplicada I: Desarrollo de algoritmo en Python (NumPy) para el cálculo automatizado de autovalores y autovectores.",
            "Sistemas Administrativos: Consultoría de procesos, rediseño de circuitos de abastecimiento y gestión de riesgos en Empresa B certificada.",
          ],
          longDesc:
            "Foco académico en Métodos Cuantitativos, Estadística Matemática y Macroeconomía. Investigación independiente en Data Science y aplicación de algoritmos (Python/R) a modelos actuariales. Enfoque en la integración de modelos matemáticos con herramientas computacionales y análisis de procesos de negocio.\n\nProyecto Destacado: Matemática Aplicada I (Modelado Computacional)\n• Desarrollo de algoritmo en Python utilizando la librería NumPy para el cálculo automatizado de autovalores y autovectores.\n• Implementación práctica de conceptos de Álgebra Lineal para optimizar el análisis de matrices y sistemas de ecuaciones.\n\nProyecto Destacado: Sistemas Administrativos (Caso Real: Dar Sentido S.R.L.)\n• Consultoría de Procesos: Diagnóstico y rediseño del circuito de Abastecimiento/Compras en una Empresa B certificada, utilizando diagramas de interdependencia sectorial.\n• Gestión de Riesgos y Control Interno: Detección de falencias en la segregación de funciones y diseño de un nuevo marco de control preventivo y documental.\n• Análisis Organizacional: Evaluación de la estructura y mecanismos de coordinación para optimizar la toma de decisiones estratégicas.",
        },
        {
          period: "Mar 2018 - Nov 2023",
          institution: "Colegio Santa Teresa de Jesús",
          degree: "Bachiller en Ciencias Sociales y Humanidades",
          desc: "Formación humanista centrada en el pensamiento crítico y la conciencia social. Desarrollo de habilidades fundamentales que complementan mi formación técnica.",
          descBullets: [
            "Iniciativa y Ventas: Gestión y liderazgo en ventas para financiamiento colectivo, asegurando el cumplimiento de objetivos grupales.",
            "Voluntariado y Liderazgo: Participación activa en proyectos sociales (TECHO), desarrollando adaptabilidad, trabajo en equipo y gestión de recursos bajo presión.",
            "Habilidades Blandas: Comunicación efectiva y empatía como bases que hoy complemento con la formación técnica.",
          ],
          // La tarjeta ya muestra todo el contenido: el click abre la vista ampliada
          clickHint: "Ver en pantalla completa →",
          longDesc:
            "Formación humanista centrada en el pensamiento crítico y la conciencia social. Voluntariado en TECHO, deportes y actividades de acción social. Desarrollo de habilidades fundamentales que hoy complemento con mi formación técnica en Actuario y Ciencia de Datos.\n\nIniciativa y Ventas:\n• Para costear el viaje de egresados, me encargué de la venta de productos (tortas, rifas).\n• No me limité a vender mi parte; me ofrecí a gestionar y vender los productos de algunos compañeros para asegurar que todos llegaran al objetivo.\n• Fue mi primer contacto real con la venta y el trato con la gente.\n\nVoluntariado y Liderazgo:\n• Participación activa en proyectos sociales (TECHO).\n• Desarrollo de habilidades de trabajo en equipo, adaptabilidad en terreno y gestión de recursos bajo presión.\n\nHabilidades Blandas:\n• Comunicación efectiva y empatía como bases que hoy complemento con la formación técnica.",
        },
      ],
      courses: [
        {
          category: "Ingeniería y Arquitectura de IA Avanzada",
          items: [
            "Model Context Protocol (MCP): Advanced Topics - Anthropic",
            "Introduction to Model Context Protocol - Anthropic",
            "Introduction to Agent Skills - Anthropic",
            "Introduction to Subagents - Anthropic",
          ],
        },
        {
          category: "Data Science y Rigor Cuantitativo",
          items: [
            "Data Science Methodology - IBM",
            "Data Science Tools - IBM",
            "Data Science Intro - Santander Open Academy",
            "Power BI - Santander Open Academy",
          ],
        },
        {
          category: "IA Aplicada y Flujos de Desarrollo",
          items: [
            "Claude Code in Action - Anthropic",
            "Claude Code 101 - Anthropic",
            "Claude Platform 101 - Anthropic",
          ],
        },
        {
          category: "Fluidez en IA y Frameworks de Interacción",
          items: [
            "AI Fluency: Framework & Foundations - Anthropic",
            "AI Fluency for Students - Anthropic",
            "AI Fluency for Educators - Anthropic",
            "Introduction to Claude Cowork - Anthropic",
            "Claude 101: Everyday Work Tasks - Anthropic",
          ],
        },
        {
          category: "Estrategia de Negocios y Liderazgo",
          items: [
            "Finanzas - FEMSA",
            "Gestión Agile - Santander Open Academy",
            "Negociación - Santander Open Academy",
            "Storytelling - Santander Open Academy",
          ],
        },
      ],
    },

    // ───────────────── SECCIÓN PROYECTOS ─────────────────
    projects: {
      eyebrow: "Work",
      title: "Proyectos",
      digitalSubtitle: "Soluciones Digitales & IA",
      businessSubtitle: "Operaciones de Negocio",

      // Hecho en HackaTwin (hackathon onchain de Twin Finance, Buenos Aires, 7/11/2026).
      // Texto sacado del README del repo Goat-Builders/agrocow (auditado en el commit 6a30a74):
      // es un prototipo sin métricas de precisión; no agregar cifras ni promesas que el código no cumple.
      agrocow: {
        date: "Nov 2026",
        category: "Hackathon onchain · Twin Finance",
        title: "AgroCow",
        badge: "HackaTwin",
        desc: "Pipeline de computer vision con IA: un modelo YOLO11 detecta a cada vaca en el video y un algoritmo ByteTrack le asigna un ID y la sigue cuadro a cuadro. Mide su tiempo en las zonas de comedero y bebedero y marca cambios de conducta, como aislamiento o inmovilidad, que suelen aparecer antes que los signos clínicos. No diagnostica: señala qué vacas revisar primero, para que el cuidador encuentre lo antes posible a las que pueden estar enfermas y evite problemas más graves.",
        tags: ["Computer Vision", "Pipeline de datos", "Estrategia de producto", "Prototipado"],
      },

      // En pausa (pedido de Matías, 2026-11-10): va al final de la categoría
      symbiosis: {
        date: "Abr 2026",
        category: "Flagship · En pausa",
        title: "Symbiosis AI",
        desc: "Tras encuestar a +80 estudiantes universitarios en CABA de entre 17-28 años, identifiqué una frustración constante: el miedo a quedar obsoletos frente a las herramientas que exige el mercado laboral actual. SymbiosisAI nace para cerrar esa brecha. No es solo una plataforma de estudio, es un ecosistema que enseña material de estudio universitario a través de la programación y el uso de tecnología real. Monitorea el progreso en tiempo real y ajusta el plan de aprendizaje para que el estudiante no solo apruebe sus materias, sino que domine las herramientas que lo harán competitivo el día de mañana.",
        tags: ["Python Backend", "LLM API Integration", "Streamlit UI", "RAG (Retrieval-Augmented Generation)"],
        comingSoonLabel: "En pausa",
        clickHint: "Click para recibir novedades",
      },

      zira: {
        date: "Ago 2026",
        category: "Hackathon · 24 horas",
        badge: "Aleph Hackathon",
        title: "ZIRA - Agente de Conciliación Financiera con IA",
        desc: "Desarrollado en 24 horas durante el Aleph Hackathon. ZIRA es un agente de IA que recibe comprobantes desde una carpeta local y ejecuta OCR y matching 100% on-device contra un CSV bancario. Prioriza alertar anomalías antes que fallar en silencio, garantizando la privacidad total de los datos financieros sensibles mediante tecnología descentralizada QVAC.",
        tags: ["QVAC SDK", "Python", "Local UI"],
        links: {
          github: "", // TODO: pegar la URL del repo de GitHub (ya cubierto por el botón Propuesta)
          review: "", // TODO: pegar la URL del post/review
        },
      },

      oneiric: {
        date: "Julio 2026",
        category: "Hackathon · 1.ª edición",
        badge: "SideQuest Hackathon",
        title: "OneiricAi",
        desc: "Desarrollado en solo 4 horas durante la primera edición del hackathon SideQuest. OneiricAi nace de un problema que todos conocemos: casi todo lo que soñamos se borra a los pocos minutos de despertar, y con eso se pierden ideas, escenas y recuerdos que nos gustaría conservar.\n\nLa plataforma integra IA para reconstruir tus sueños en formato de video a partir del contexto que vos le aportás, es decir, los fragmentos que sí recordás al despertar. Esa información se combina con patrones biológicos como la frecuencia cardíaca y los ciclos de sueño, medidos a lo largo de la noche por dispositivos wearable como el Apple Watch.\n\nEse cruce entre tu relato y tus datos biológicos es lo que hace única a la propuesta: el video generado no es una invención, es una reconstrucción respaldada por lo que tu cuerpo registró esa noche. Esos videos se pueden publicar directamente desde la aplicación en la red social integrada de Oneiric o compartirlos en plataformas como TikTok e Instagram. La diferencia clave con el resto de las redes sociales es que acá no se puede mentir ni aparentar: cada video está anclado a datos biológicos reales, lo que elimina las falsas apariencias. Por eso la llamamos 'The Healthy Social Network'.",
        tags: ["Video con IA generativa", "Biometría", "Estrategia de producto", "Hackathon"],
      },

      nexstock: {
        date: "Mayo 2026",
        category: "Procesos y Operaciones",
        badge: "Bootcamp ITBA",
        title: "NexStock",
        desc: "Contexto de ejecución\n• Propuesta de valor y modelo de negocio desarrollados y validados en 3 días de inmersión intensiva.\n\nEl problema\n• Las PyMEs que venden en múltiples canales —Mercado Libre, WhatsApp, Tienda Nube, mostrador— no logran sincronizar su dato de stock en tiempo real.\n• El resultado son sobreventas, cancelaciones y pérdidas silenciosas de hasta el 10% de la facturación anual.\n\nLa solución\n• Sincronización del dato de stock de los distintos canales de venta en tiempo real para PyMEs, con distribución inteligente por canal y reposición automática con proveedores.\n\nMi rol\n• Lideré el equipo en el BootCamp Emprendedores ITBA 2026, dentro de la categoría Procesos y Operaciones (Pan American Silver).\n• Estuve a cargo del análisis de datos de mercado, el diseño de los mockups del producto, la estructuración de la propuesta de negocio y la coordinación del equipo para optimizar tiempos y llegar con la idea lista para vender.\n• Presentamos la solución ante un jurado integrado por el CEO de Bianca, la Brand Experience Leader de Supervielle y el Chief Innovation & Transformation Officer de Teleperformance.",
        tags: ["Product Strategy", "Data Analysis", "UX/UI", "Team Leadership"],
      },

      budgents: {
        date: "May 2025",
        category: "Automatización - +3 PYMEs",
        title: "Budgents - AI Agents",
        role: "Co-Founder & Chief AI Architect",
        desc: "Desarrollo de ecosistemas para escalar la atención al cliente sin perder calidad, permitiendo el foco en actividades de alto impacto. Evolucioné de Make a n8n para maximizar la flexibilidad técnica e integrar un mayor volumen de APIs. La solución automatiza el primer contacto, la calificación de leads y el agendamiento para PYMEs y marcas personales. Mediante webhooks e integración con Supabase, toda la data se registra y organiza automáticamente en tiempo real para un seguimiento estratégico impecable.",
        tags: ["LLMs", "APIs", "Webhooks", "N8N"],
      },

      nutriops: {
        date: "Dic 2025",
        category: "Operations Research - Fitness",
        title: "NutriOps",
        desc: "Uno de mis side-hustle es ser personal trainer, y muchos clientes me plantean la misma situación: no saben cómo hacer bien las compras de supermercado para seguir su alimentación sin gastar de más. Por eso creé NutriOps, un modelo de programación lineal que maximiza el rendimiento nutricional bajo restricciones presupuestarias. El sistema se alimenta de un pipeline de web scraping desarrollado para extraer, en tiempo real, precios y stock de las principales cadenas de supermercados en CABA. Mediante Excel Solver, el modelo procesa esta data para generar la combinación óptima de alimentos al menor costo posible.",
        tags: ["Excel Solver", "Linear Programming", "Web Scraping", "Operations Research"],
      },

      // ============ OPERACIONES DE NEGOCIO: IMPORTS BELLIDO ============
      imports: {
        date: "Marzo 2025",
        category: "Importaciones - E-commerce",
        title: "Bellido Importaciones",
        role: "Founder & Operations Lead",
        desc: "Lo que comenzó en el nicho de la perfumería evolucionó hacia un servicio de importaciones minoristas 100% bajo pedido, eliminando costos operativos de stock y maximizando la eficiencia del capital. Mi enfoque central es conectar el mercado de Estados Unidos con el público local, garantizando precios competitivos mediante el análisis de ofertas internacionales.\n\nMi valor agregado no termina ahí: también optimizo la adquisición de productos nacionales. Me encargo de rastrear los mejores precios locales contactando directamente con proveedores para evitar sobrecostos de intermediarios. Me especializo en detectar oportunidades de ahorro en cualquier categoría y negociar condiciones ventajosas, logrando un equilibrio real entre la logística estratégica y la inteligencia financiera.",
        tags: ["Importaciones", "USA-LATAM", "Negociación", "Logística"],
      },

      // ============ OPERACIONES DE NEGOCIO: BELLIDO ASESORAMIENTOS ============
      asesoramientos: {
        date: "Junio 2023",
        category: "Coaching & Educación",
        title: "Bellido Asesoramientos",
        role: "Founder",
        desc: "Este proyecto nació de una necesidad personal de progreso y una vocación natural por la enseñanza. Comencé ayudando a otros jóvenes a dar sus primeros pasos en el gimnasio; lo que empezó como una búsqueda de mis primeros ingresos, se transformó rápidamente en un servicio con resultados reales que me llevó a profesionalizarme con certificaciones de la IFBB.\n\nEn este proceso, identifiqué una problemática común: el momento más crítico es el inicio. La falta de guía al empezar un hábito o una materia es lo que suele llevar al abandono. Por eso, en junio de 2023, decidí expandir esta filosofía al ámbito académico para atacar el mismo problema desde otro ángulo, aplicando un enfoque de gestión integral y resultados medibles.\n\nGestión Estratégica y Cartera:\n• Gestión integral de cartera de clientes: Planificación estratégica y cumplimiento de objetivos a corto, mediano y largo plazo para asegurar el éxito del proceso. (educación/fitness)\n• Gestión y retención de usuarios: Seguimiento personalizado para maximizar la adherencia al plan, logrando consistencia a través de comunicación efectiva y feedback continuo. (educación/fitness)\n• Enfoque orientado a resultados: Establecimiento de KPIs claros y monitoreo semanal para garantizar la evolución constante y la satisfacción del cliente. (educación/fitness)\n\nAcompañamiento e Inteligencia de Datos:\n• Planificación basada en datos: Diseño y periodización de mesociclos de entrenamiento, ajustando variables de volumen e intensidad según la respuesta fisiológica y el análisis de progreso. (fitness)\n• Navegación de procesos iniciales: Servicio diseñado para ayudar a las personas a transitar el comienzo de sus cursos o rutinas, brindando apoyo emocional y motivación. (educación/fitness)\n• Planificación personalizada: Creación de hojas de ruta individuales adaptadas al ritmo de vida y metas de cada usuario. (educación/fitness)\n\nLiderazgo y Dominio Técnico:\n• Gestión & Delegación: Liderazgo y coordinación de un equipo de profesionales para cubrir la demanda, asignándolos estratégicamente según el perfil y la necesidad técnica del cliente. (educación/fitness)\n• Dominio Técnico Avanzado: Dictado personal de materias de alta complejidad lógica (Análisis Matemático, Álgebra Lineal y Estadística Descriptiva). (educación)\n• Optimización de la Transición: Garantía de un proceso fluido entre la incertidumbre inicial y la aprobación de la materia o la consecución de la meta física. (educación/fitness)",
        tags: ["Liderazgo de equipos", "Gestión de clientes", "Mentorías", "Networking"],
      },

      modal: {
        title: "Quiero ser parte",
        desc: "Symbiosis AI está en pausa. Dejame tu email y te aviso cuando lo retome.",
        placeholder: "tu@email.com",
        button: "Avisarme",
      },
    },

    footer: {
      eyebrow: "Contacto",
      title: "Colaboremos",
      desc: "Abierto a colaboraciones, eventos y conversaciones sobre IA, Data y Emprendimientos.",
      emailLabel: "Email",
      locationLabel: "Ubicación",
      location: "CABA, Argentina",
      role: "Actuario & Data Analyst",
      tagline: "IA, Automatización y Estrategia de Negocios",
      rights: "© 2026 Matías Rodrigo Bellido. Todos los derechos reservados.",
      // Formulario de contacto. {provider} se reemplaza por "Gmail" u "Outlook".
      form: {
        providerLabel: "Enviar con",
        nameLabel: "Nombre (opcional)",
        namePlaceholder: "¿Cómo te llamás?",
        emailLabel: "Tu email",
        emailPlaceholder: "tu@email.com",
        messageLabel: "Mensaje",
        messagePlaceholder: "Contame en qué te puedo ayudar...",
        submit: "Abrir en {provider}",
        hint: "Se abre {provider} con el asunto y el mensaje listos: solo te queda tocar Enviar.",
        opened: "Listo: {provider} se abrió en una pestaña nueva.",
        subject: "Consulta desde el portfolio",
        greeting: "Hola Matías,",
        emailLine: "Mi email:",
      },
    },

    // ───────────────── LANDING /fitness (Bellido Asesoramientos) ─────────────────
    // Fuente: PDF "Bellido Asesoramientos Fitness". Solo contenido de entrenamiento.
    fitness: {
      whatsappMessage: "Hola Matías, vi la página de Bellido Asesoramientos. Mi objetivo es: ",
      nav: {
        // En el orden de la página: el header marca en cuál estás y cuáles ya pasaste
        links: [
          { id: "sobre-mi", label: "Quién soy" },
          { id: "resultados", label: "Resultados" },
          { id: "metodo", label: "Método" },
          { id: "empezar", label: "Cómo empezar" },
          { id: "planes", label: "Planes" },
          { id: "preguntas", label: "Preguntas" },
        ],
        cta: "Escribime",
        menu: "Abrir menú",
        close: "Cerrar menú",
        home: "Ir al inicio de la página",
        lang: "Cambiar el idioma a inglés",
        langOther: "English",
      },
      hero: {
        tagline: "Entrenamiento con criterio real.",
        who: "Para quienes quieren mejorar su composición corporal, su rendimiento o su técnica y no logran sostener el progreso.",
        method: ["Mesociclos según tu progreso", "Alimentación sin prohibiciones", "Seguimiento por WhatsApp"],
        cta: "Escribime por WhatsApp",
        ctaSecondary: "Ver planes",
        photoAlt: "Matías Bellido entrenando",
        loop: ["Planificar", "Ajustar", "Progresar"],
      },
      audience: {
        eyebrow: "Para quién es",
        title: "Para quien entrena y no ve el progreso que busca.",
        whoTitle: "Te sirve si querés",
        who: ["Mejorar tu composición corporal", "Rendir más en cada entrenamiento", "Mejorar tu técnica", "Ser constante"],
        problemsTitle: "Lo que suele frenar el progreso",
        problems: [
          { title: "Falta de planificación", desc: "Entrenás lo que sale ese día. Sin un plan por etapas, el cuerpo no tiene motivo para seguir adaptándose." },
          { title: "Estancamiento", desc: "Las cargas y el espejo no se mueven hace meses, aunque no faltes al gimnasio." },
          { title: "Dietas restrictivas", desc: "Planes que te prohíben todo, que dejás a las pocas semanas y te devuelven al punto de partida." },
          { title: "Lesiones por mala técnica", desc: "Ejecuciones que nadie corrigió y que terminan en molestias o en lesiones que cortan la continuidad." },
          { title: "Falta de seguimiento", desc: "Nadie te pregunta cómo te fue ni ajusta el plan cuando algo no funciona." },
        ],
        closing: "Por eso trabajo con un plan por etapas, que se ajusta a tu respuesta y que se sigue de cerca.",
      },
      about: {
        eyebrow: "Quién soy",
        title: "Empecé ayudando a otros a dar sus primeros pasos en el gimnasio.",
        paragraphs: [
          // Texto de Matías (2026-11-06), con tildes y erratas corregidas
          "Soy Matías Bellido. En 2021 empecé a entrenar y me obsesioné con ganar músculo, verme bien y ser más fuerte. Entrené día tras día. Un año después, ya viendo resultados, iba al gimnasio y veía a chicos que recién arrancaban y me recordaban a mí cuando recién empezaba: con ganas, pero sin saber por dónde empezar.",
          "El fitness me apasiona: llevar una buena alimentación y seguir rutinas en base a un objetivo. Eso me llevó a darles una mano: los ayudaba con sus primeras rutinas y a entender qué hacían y para qué.",
          "Con el tiempo decidí especializarme en musculación, fuerza y distintos métodos de entrenamiento, para ayudar a personas a alcanzar su objetivo.",
          "Hoy, junto a Bellido Asesoramientos, lidero un equipo que me ayuda a seguir de cerca a cada persona, en modalidad virtual o presencial.",
          // Dato de Matías (2026-11-10); redacción más profesional a pedido suyo
          "Al día de hoy, más de 30 personas alcanzaron sus objetivos físicos con mi asesoramiento personalizado.",
        ],
        photoAlt: "Matías Bellido",
        facts: [
          { label: "Entrenando desde", value: "2021" },
          { label: "Con clientes desde", value: "2023" },
          { label: "Modalidad", value: "Virtual o presencial" },
        ],
        certsTitle: "Certificaciones",
        certs: [
          "IFBB Academy — Personal Trainer / Bodybuilding Instructor",
          "ISSA — Certified Personal Trainer",
          "IFBB Academy — Cross Pro Fitness",
          "IFBB Academy — Nutrición Deportiva",
        ],
        certView: "Ver certificado",
        certNewTab: "(se abre en otra pestaña)",
        certClose: "Cerrar certificado",
        certAlt: "Certificado",
        certMissing: "Error 404",
        certMissingTitle: "Certificado disponible próximamente",
        certMissingDesc: "La versión digital de este certificado todavía no está publicada. Mientras tanto, podés consultar el resto de mis certificaciones.",
      },
      start: {
        eyebrow: "Cómo empezar",
        title: "De este mensaje a tu primera sesión.",
        intro: "Esto es lo que pasa después de que me escribís, paso por paso.",
        freeCall: "Antes de decidir, si querés, tenés una charla gratis 1 a 1 conmigo sobre tu situación.",
        stepLabel: "Paso",
        steps: [
          { title: "Formulario inicial", desc: "Te mando un formulario corto con tus datos, tu historial y tus horarios. Es el requisito para armar un plan hecho para vos.", when: "Apenas me escribís" },
          { title: "Analizo tu objetivo", desc: "Con tus respuestas veo qué querés lograr y desde dónde arrancás: tu objetivo y tu estado físico actual.", when: "Con el formulario" },
          { title: "Rutina y alimentación", desc: "Recibís tu rutina de entrenamiento y tu programa de alimentación personalizados.", when: "En unos 2 días" },
          { title: "Seguimiento por WhatsApp", desc: "Cada vez que entrenás, te escribo para saber cómo te fue y ajusto lo que haga falta.", when: "Después de cada entrenamiento" },
        ],
        cta: "Escribime por WhatsApp",
      },
      method: {
        eyebrow: "Mi método",
        title: "Planificado, medido y ajustado a tu respuesta.",
        intro: "Antes de empezar es importante que entiendas cómo trabajo, para que no haya malentendidos.",
        items: [
          { title: "Mesociclos", desc: "Divido tu entrenamiento en bloques y ajusto el volumen y la intensidad según tu respuesta física y el análisis de tu progreso." },
          { title: "Alimentación sin prohibiciones", desc: "No prohíbo ningún alimento: te informo y te aconsejo lo más favorable para tu situación. Si querés sumar algo que te gusta, lo incorporo." },
          { title: "Seguimiento por WhatsApp", desc: "Después de cada entrenamiento te escribo para saber cómo te fue, mejorar tu rendimiento y que tengas ganas de seguir." },
          { title: "Virtual, con honestidad", desc: "En la modalidad virtual es más difícil corregir la ejecución. Por eso podés escribirme cuando quieras y te mando un video que la explica." },
        ],
        sheet: {
          label: "Ejemplo de un bloque",
          note: "Ejemplo ilustrativo: así sube la carga semana a semana dentro de un mesociclo.",
          columns: ["Ejercicio", "Sem 1", "Sem 2", "Sem 3", "Sem 4"],
          rows: [
            { exercise: "Sentadilla · kg", values: ["60", "62,5", "65", "67,5"] },
            { exercise: "Remo · kg", values: ["40", "42,5", "42,5", "45"] },
            { exercise: "Plancha · seg", values: ["30", "40", "45", "60"] },
          ],
        },
      },
      assimilation: {
        eyebrow: "Asimilación del deportista",
        title: "Tus primeros tres meses, etapa por etapa.",
        intro: "El entrenamiento personal es un servicio de mediano o largo plazo. Así se organizan los primeros meses, para que sepas exactamente qué hago y por qué.",
        monthLabel: "Mes",
        months: [
          "Entiendo tu objetivo y tu estado físico actual, y mejoro tu técnica en los ejercicios para que el progreso siguiente sea más eficiente y rápido.",
          "Con tu situación más clara, detecto tus puntos débiles para pulirlos, subo las cargas y ajusto tu dieta según tu rendimiento.",
          "Empiezo a intercalar bloques de fuerza e hipertrofia para mejorar tu rendimiento y tu composición corporal, evitando el estancamiento y posibles lesiones.",
        ],
      },
      results: {
        eyebrow: "Resultados",
        title: "Progresos de personas que entrenan conmigo.",
        intro: "Fotos de antes y después de clientes, publicadas con su autorización.",
        before: "Antes",
        after: "Después",
        clientLabel: "Cliente",
        pending: "Foto pendiente",
        // Tiempo del cambio de cada cliente (dato de Matías, 2026-11-06). Vacío = no se muestra.
        captions: ["16 semanas", "22 semanas", "12 semanas", "28 semanas"],
        disclaimer: "Fotos publicadas con autorización de cada persona. Los resultados dependen del punto de partida, la constancia y el tiempo de cada uno.",
        hint: "Arrastrá la barra para comparar el antes y el después.",
        compare: "comparar antes y después",
        carouselLabel: "Resultados de clientes: antes y después",
        pause: "Pausar el carrusel",
        play: "Reanudar el carrusel",
      },
      faq: {
        eyebrow: "Preguntas frecuentes",
        title: "Lo que suelen preguntarme.",
        intro: "Si algo no queda claro, preguntame las veces que sea necesario.",
        groups: [
          {
            title: "Entrenamiento",
            items: [
              { q: "¿Qué hago si un ejercicio no me sale bien?", a: "Escribime y te mando un video explicativo para ayudarte." },
              { q: "¿Y si no quiero o no puedo ir al gimnasio?", a: "Contame el motivo y te armo una rutina que se adapte a tus necesidades." },
              { q: "¿Cuántos días por semana tengo que entrenar?", a: "Los decidís vos." },
              { q: "¿Puedo preguntar todas las veces que quiera?", a: "Sí. Si algo no quedó claro, preguntame las veces que sea necesario." },
            ],
          },
          {
            title: "Alimentación",
            items: [
              { q: "¿Me vas a prohibir comidas o el alcohol?", a: "No. Te doy recomendaciones y seguirlas es tu decisión." },
              { q: "¿La dieta puede incluir suplementos?", a: "Sí, si me lo pedís: armo tu dieta incluyendo la suplementación natural como recurso." },
              { q: "¿Tengo comidas libres?", a: "Sí. No hay un número fijo: contame qué te gustaría y te digo qué se alinea mejor con tus objetivos." },
            ],
          },
        ],
      },
      plans: {
        eyebrow: "Servicios",
        title: "Elegí cómo querés entrenar.",
        intro: "Hay dos formas de trabajar conmigo. Si querés entrenar acompañado, elegí un pack: suma sesiones guiadas cada mes. Si preferís entrenar por tu cuenta con un plan hecho para vos, elegí un plan online.",
        tabsLabel: "Tipo de servicio",
        priceFallback: "Consultá el valor",
        billing: "por mes",
        includes: "Incluye",
        cta: "Consultar por WhatsApp",
        message: "Hola Matías, me interesa el {plan}. Mi objetivo es: ",
        groups: [
          {
            id: "packs",
            label: "Packs",
            sublabel: "Con sesiones guiadas",
            desc: "Asesoramiento personalizado más sesiones de entrenamiento guiadas cada mes, virtuales o presenciales. Los packs se diferencian por la cantidad de sesiones.",
            plans: [
              {
                id: "intensive",
                name: "Intensive Pack",
                highlight: "20 sesiones guiadas por mes",
                price: 395700,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento personalizada",
                  "Programa de alimentación personalizado",
                  "20 sesiones de entrenamiento guiadas, virtuales o presenciales",
                  "Acceso anticipado a productos y servicios nuevos",
                  "Videollamadas semanales (opcionales)",
                  "Acompañamiento motivacional",
                  "Recetario de regalo",
                ],
              },
              {
                id: "discipline",
                name: "Discipline Pack",
                highlight: "15 sesiones guiadas por mes",
                price: 297300,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento personalizada",
                  "Programa de alimentación personalizado",
                  "15 sesiones de entrenamiento guiadas, virtuales o presenciales",
                  "Acceso anticipado a productos y servicios nuevos",
                  "Videollamadas semanales (opcionales)",
                  "Acompañamiento motivacional",
                  "Recetario de regalo",
                ],
              },
              {
                id: "inicial",
                name: "Inicial Pack",
                highlight: "8 sesiones guiadas por mes",
                price: 181000,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "8 sesiones de entrenamiento guiadas, virtuales o presenciales",
                  "Rutina de entrenamiento y programa de alimentación personalizados",
                ],
              },
            ],
          },
          {
            id: "planes",
            label: "Planes online",
            sublabel: "Entrenás por tu cuenta",
            desc: "Recibís tu plan personalizado y entrenás por tu cuenta, sin sesiones guiadas. Van del más completo al más simple.",
            plans: [
              {
                id: "premium",
                name: "Asesoramiento Premium",
                highlight: "Videollamada semanal + 1 entrenamiento juntos por semana",
                price: 36120,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento personalizada",
                  "Programa de alimentación personalizado",
                  "Videollamadas semanales",
                  "1 entrenamiento por semana juntos en mi gimnasio, si querés (no se acumula; sujeto a disponibilidad)",
                  "Recetario de regalo",
                  "5% de descuento al renovar el mes siguiente",
                ],
              },
              {
                id: "black",
                name: "Asesoramiento Black",
                highlight: "Rutina y alimentación + videollamada semanal",
                price: 31730,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento personalizada",
                  "Programa de alimentación personalizado",
                  "Videollamadas semanales",
                  "Recetario de regalo",
                  "2,3% de descuento al renovar el mes siguiente",
                ],
              },
              {
                id: "avanzado",
                name: "Asesoramiento Avanzado",
                highlight: "Rutina y alimentación personalizadas",
                price: 29360,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento personalizada",
                  "Programa de alimentación personalizado",
                  "Recetario de regalo",
                ],
              },
              {
                id: "rutina-alimentacion",
                name: "Rutina y Programa de alimentación",
                highlight: "Rutina o alimentación: elegís una",
                price: 26770,
                items: [
                  "Asesoramiento personalizado 1 a 1",
                  "Rutina de entrenamiento o programa de alimentación personalizado (elegís uno)",
                  "Recetario de regalo",
                ],
              },
              {
                id: "rutinas-medida",
                name: "Rutinas a medida",
                highlight: "Rutina básica, la opción más económica",
                price: 22180,
                items: ["Rutina de entrenamiento básica según tu objetivo", "Asesoramiento personalizado 1 a 1"],
              },
            ],
          },
        ],
        inPerson: {
          id: "presencial",
          title: "Entrenamiento asesorado presencial",
          desc: "Clases 1 a 1 en el gimnasio. Sumá al carrito las que quieras o consultame por un pack de clases. Antes de empezar te paso los términos y condiciones.",
          price: 24700,
          unit: "por clase",
          cta: "Consultar por un pack",
          message: "Hola Matías, quiero consultar por un pack de clases presenciales.",
        },
      },
      infoproducts: {
        eyebrow: "Infoproductos",
        title: "Material para entender lo que hacés.",
        intro: "Guías para seguir aprendiendo por tu cuenta, entre sesión y sesión.",
        unit: "pago único",
        // De mayor a menor precio (pedido de Matías)
        items: [
          { id: "anatomia", title: "Anatomía muscular", price: 24700, items: ["Biomecánica y tips de entrenamiento fundamentados por la ciencia para mejorar tus resultados"] },
          {
            id: "alimentacion",
            title: "Alimentación saludable",
            price: 24700,
            items: ["Tips de alimentación y nutrición", "Teoría de suplementación", "Teoría científica", "Alteración hormonal por alimentación"],
          },
          { id: "recetario", title: "Recetario", price: 15800, items: ["Más de 10 recetas saludables que te ayudan a ahorrar tiempo en la cocina"] },
        ],
      },
      // Carrito: nombres y botón según la decisión de Matías ("Carrito", "🛒 Agregar al carrito")
      cart: {
        add: "🛒 Agregar al carrito",
        inCart: "En el carrito · Ver",
        open: "Ver carrito",
        title: "Carrito",
        close: "Cerrar carrito",
        steps: ["Carrito", "Pago", "Formulario"],
        empty: "Tu carrito está vacío.",
        emptyCta: "Ver planes y packs",
        remove: "Quitar",
        less: "Una clase menos",
        more: "Una clase más",
        total: "Total",
        monthNote: "Los planes y packs son mensuales: este pago es el primer mes.",
        toPay: "Ir a pagar",
        payTitle: "Pagá con Mercado Pago",
        payIntro: "Transferí exactamente el total a Matías Rodrigo Bellido. Después volvé a esta página y tocá \"Ya pagué\".",
        payButton: "Pagar con Mercado Pago",
        qrLabel: "O escaneá el QR con la app de Mercado Pago",
        aliasLabel: "Alias",
        cvuLabel: "CVU",
        nameLabel: "Titular",
        copy: "Copiar",
        copied: "Copiado",
        paid: "Ya pagué",
        back: "Volver al carrito",
        doneTitle: "¡Gracias por tu compra!",
        doneDesc: "Último paso: completá el formulario para que pueda armar tu plan y enviarte lo que compraste.",
        formButton: "Completar el formulario",
        formPending: "El formulario va a estar acá muy pronto. Mientras tanto, mandame el comprobante por WhatsApp y te lo paso.",
        receipt: "Enviar comprobante por WhatsApp",
        receiptMessage: "Hola Matías, ya pagué por Mercado Pago. Compré: {items}. Total: {total}.{extras} Te mando el comprobante.",
        finish: "Terminar",
        codeLabel: "Código de descuento",
        referrerLabel: "Te recomendó",
        removeExtra: "Quitar",
        subtotal: "Subtotal",
        discount: "Descuento",
        discountChip: "Primer mes con descuento",
        discountChipOnce: "Con descuento",
        originalPrice: "Precio original",
        finalPrice: "Precio con descuento",
        extrasCode: " Código de descuento: {code}.",
        extrasReferrer: " Me recomendó: {name}.",
        units: { month: "por mes", once: "pago único" },
      },
      affiliates: {
        eyebrow: "Afiliados",
        title: "Recomendá el servicio y llevate una comisión.",
        intro: "Por cada persona que contrate el servicio online por tu recomendación, te llevás una parte del valor de su plan.",
        firstValue: "25%",
        firstLabel: "del valor del primer mes",
        afterValue: "20%",
        afterLabel: "de los meses siguientes, como ingreso residual",
        payout: "Lo cobrás en tu cuenta o se descuenta de tu próximo pago, así el servicio te puede salir gratis.",
        example: "Ejemplo: si recomendás un plan de $100, el primer mes te llevás $25.",
        cta: "Quiero ser afiliado",
        message: "Hola Matías, quiero sumarme al programa de afiliados de Bellido Asesoramientos.",
        referral: {
          code: {
            title: "Código de descuento",
            desc: "Si tenés un código, anotalo acá. Se descuenta automáticamente de todo lo que compres (en planes y packs, del primer mes) y lo ves reflejado en el carrito.",
            label: "Tu código",
            placeholder: "Escribilo acá",
            applied: "Código aplicado",
            invalid: "Ese código no es válido. Revisalo y probá de nuevo.",
          },
          referrer: {
            title: "Afiliado",
            desc: "¿Te recomendó alguien? Escribí su nombre y queda anotado junto a tu compra, así puedo reconocer su recomendación.",
            label: "Nombre de quien te recomendó",
            placeholder: "Nombre y apellido",
          },
          save: "Guardar",
          saved: "Guardado en tu compra",
          clear: "Quitar",
        },
      },
      contact: {
        title: "Contame tu objetivo y armo tu punto de partida.",
        desc: "Escribime por WhatsApp con tu situación. Te respondo con honestidad si te puedo ayudar y qué plan te conviene.",
        cta: "Escribime por WhatsApp",
        freeCall: "La primera charla 1 a 1 es gratis.",
        emailLabel: "Escribir por email a rbellidomatias@gmail.com",
        email: "rbellidomatias@gmail.com",
      },
      footer: {
        back: "Ir al portfolio profesional →",
        health: "El entrenamiento no reemplaza la consulta médica. Si tenés una lesión o un dolor persistente, consultá primero con un profesional de la salud. Menores de 18 años, con autorización de un adulto responsable.",
        rights: "© 2026 Matías Rodrigo Bellido · Bellido Asesoramientos",
        withdrawal: "Botón de arrepentimiento",
        withdrawalMessage: "Hola Matías, quiero arrepentirme de mi compra (botón de arrepentimiento). Mi nombre es: ",
      },
    },
  },

  // ==========================================================================
  // INGLÉS (ENGLISH)
  // ==========================================================================
  en: {
    nav: {
      home: "Home",
      skills: "Skills",
      projects: "Projects",
      experience: "Experience",
      contact: "Contact",
    },
    hero: {
      badge: "Actuary & Data Analyst",
      location: "Buenos Aires, Argentina",
      locationShort: "Buenos Aires",
      titleLine1: "Hi! I'm",
      titleLine2: "Matías Bellido",
      desc: "**Actuarial Science** student (FCE-⁠UBA), focused on **Data Analysis** and applied AI. I build solutions that turn complex data into clear decisions.",
      ctaProjects: "View Projects",
      ctaAbout: "About me",
    },
    bio: {
      eyebrow: "Matías Rodrigo Bellido",
      title: "Skills",
      categories: {
        data: "Data & Analytics",
        ai: "AI & Automation",
        dev: "Development & Tools",
        prof: "Professional",
      },
      englishSkill: "C1 English",
      manifesto:
        "I decided to study Actuarial Science for several reasons. One is the challenge of taking on a degree as demanding as this one; another is the chance to learn how to use and understand statistical tools that will help me in any project I take on. I'm grateful for the analytical mindset the degree gives me.",
    },
    experience: {
      eyebrow: "Journey",
      title: "Experience & Education",
      experienceTitle: "Experience",
      educationTitle: "Education",
      coursesTitle: "Complementary Training",
      items: [
        {
          period: "Apr 2024 - Present",
          role: "Private Academic Tutor",
          company: "Freelance - Autónomo",
          type: "Math & Statistics",
          desc: "I coordinate a staff of teachers covering demand at primary, secondary, and university levels. I teach advanced classes in Mathematical Analysis, Linear Algebra, and Descriptive Statistics (UBA CBC and First Year), translating abstract concepts to each student's pace.",
          tags: ["Leadership", "Teaching", "Team Management"],
        },
        {
          period: "Jun 2023 - Present",
          role: "Personal Trainer & Wellness Coach",
          company: "Freelance - Autónomo",
          type: "Hybrid",
          desc: "End-to-end management of client portfolio with data-driven planning. I design mesocycles adjusting volume and intensity according to weekly physical KPIs. I set clear metrics and monitor progress to guarantee adherence and results.",
          tags: ["KPIs", "Strategic Planning", "Retention"],
        },
        {
          period: "Dec 2024 - Nov 2025",
          role: "Customer Experience",
          company: "Arcos Dorados",
          type: "Part-time - On-site",
          desc: "Intense work experience in a corporate environment with high operational standards. Precise execution of standardized processes under time and efficiency metrics, problem-solving in high-demand moments, and constant coordination with staff.",
          tags: ["Operations", "Teamwork", "High Pressure"],
        },
        {
          period: "Aug 2024 - Dec 2024",
          role: "Business Development Manager",
          company: "SomeClub",
          type: "Part-time - Hybrid",
          desc: "Role focused on strategic prospecting and lead qualification for the sales team. CRM database management and updates, funnel analysis (response rate, scheduling), and B2B/B2C communication identifying pain points in potential clients.",
          tags: ["CRM", "Funnel Analysis", "B2B/B2C"],
        },
        {
          period: "Feb 2024 - Aug 2024",
          role: "Sales Consultant",
          company: "FIAT Argentina",
          type: "Full-time - On-site",
          desc: "End-to-end management of the sales cycle and commercial advisory in the automotive sector, focused on monthly target achievement and customer satisfaction. Closing through consultative negotiation techniques and objection handling.",
          tags: ["Negotiation", "Sales", "Sales KPIs"],
        },
        {
          period: "Aug 2023 - Dec 2023",
          role: "Research Assistant (Intern)",
          company: "Fundación Apolo",
          type: "Internship - On-site",
          desc: "Participation in the ACAP program of the City Government. Collaboration on institutional transparency and public policy projects: source research and synthesis, document organization support, and executive summary writing.",
          tags: ["Research", "Public Policy", "Analysis"],
        },
      ],
      education: [
        {
          period: "Apr 2024 - Oct 2028",
          institution: "University of Buenos Aires",
          degree: "Actuarial Science",
          desc: "Academic focus on Quantitative Methods, Mathematical Statistics, and Macroeconomics. Independent research in Data Science and the application of algorithms (Python/R) to actuarial models.",
          descBullets: [
            "Applied Mathematics I: Developed a Python algorithm (NumPy) for the automated calculation of eigenvalues and eigenvectors.",
            "Administrative Systems: Process consulting, redesign of supply chain circuits, and risk management at a certified B Corp.",
          ],
          longDesc:
            "Academic focus on Quantitative Methods, Mathematical Statistics, and Macroeconomics. Independent research in Data Science and the application of algorithms (Python/R) to actuarial models. Focus on the integration of mathematical models with computational tools and business process analysis.\n\nFeatured Project: Applied Mathematics I (Computational Modeling)\n• Development of a Python algorithm using the NumPy library for the automated calculation of eigenvalues and eigenvectors.\n• Practical implementation of Linear Algebra concepts to optimize matrix and equation system analysis.\n\nFeatured Project: Administrative Systems (Real Case: Dar Sentido S.R.L.)\n• Process Consulting: Diagnosis and redesign of the Procurement circuit at a certified B Corp, using sectoral interdependence diagrams.\n• Risk Management and Internal Control: Detection of weaknesses in segregation of duties and design of a new preventive and documentary control framework.\n• Organizational Analysis: Evaluation of structure and coordination mechanisms to optimize strategic decision-making.",
        },
        {
          period: "Mar 2018 - Nov 2023",
          institution: "Santa Teresa de Jesús School",
          degree: "High School Diploma in Social Sciences and Humanities",
          desc: "Humanist education centered on critical thinking and social awareness. Development of foundational skills that complement my technical training.",
          descBullets: [
            "Initiative and Sales: Management and leadership in sales for collective fundraising, ensuring group goals were met.",
            "Volunteering and Leadership: Active participation in social projects (TECHO), developing adaptability, teamwork, and resource management under pressure.",
            "Soft Skills: Effective communication and empathy as foundations that I now complement with technical training.",
          ],
          clickHint: "View full screen →",
          longDesc:
            "Humanist education centered on critical thinking and social awareness. Volunteering at TECHO, sports, and social action activities. Development of foundational skills that I now complement with my technical training in Actuarial Science and Data Science.\n\nInitiative and Sales:\n• To pay for the senior class trip, I took charge of selling products (cakes, raffles).\n• I didn't limit myself to selling my own share; I offered to manage and sell my classmates' products to ensure everyone reached the goal.\n• It was my first real contact with sales and dealing with people.\n\nVolunteering and Leadership:\n• Active participation in social projects (TECHO).\n• Development of teamwork skills, field adaptability, and resource management under pressure.\n\nSoft Skills:\n• Effective communication and empathy as foundations that I now complement with technical training.",
        },
      ],
      courses: [
        {
          category: "Advanced AI Engineering & Architecture",
          items: [
            "Model Context Protocol (MCP): Advanced Topics - Anthropic",
            "Introduction to Model Context Protocol - Anthropic",
            "Introduction to Agent Skills - Anthropic",
            "Introduction to Subagents - Anthropic",
          ],
        },
        {
          category: "Data Science & Quantitative Rigor",
          items: [
            "Data Science Methodology - IBM",
            "Data Science Tools - IBM",
            "Data Science Intro - Santander Open Academy",
            "Power BI - Santander Open Academy",
          ],
        },
        {
          category: "Applied AI & Development Workflows",
          items: [
            "Claude Code in Action - Anthropic",
            "Claude Code 101 - Anthropic",
            "Claude Platform 101 - Anthropic",
          ],
        },
        {
          category: "AI Fluency & Interaction Frameworks",
          items: [
            "AI Fluency: Framework & Foundations - Anthropic",
            "AI Fluency for Students - Anthropic",
            "AI Fluency for Educators - Anthropic",
            "Introduction to Claude Cowork - Anthropic",
            "Claude 101: Everyday Work Tasks - Anthropic",
          ],
        },
        {
          category: "Business Strategy & Leadership",
          items: [
            "Finance - FEMSA",
            "Agile Management - Santander Open Academy",
            "Negotiation - Santander Open Academy",
            "Storytelling - Santander Open Academy",
          ],
        },
      ],
    },
    projects: {
      eyebrow: "Work",
      title: "Projects",
      digitalSubtitle: "Digital Solutions & AI",
      businessSubtitle: "Business Ops & Logic Models",

      agrocow: {
        date: "Nov 2026",
        category: "Onchain hackathon · Twin Finance",
        title: "AgroCow",
        badge: "HackaTwin",
        desc: "An AI-powered computer vision pipeline: a YOLO11 model detects each cow in the video and a ByteTrack algorithm assigns it an ID and follows it frame by frame. It measures time in the feeder and water trough zones and flags behavior changes, such as isolation or immobility, that often appear before clinical signs. It doesn't diagnose: it points out which cows to check first, so the caretaker can find the ones that may be sick as early as possible and prevent bigger problems.",
        tags: ["Computer Vision", "Data Pipeline", "Product Strategy", "Prototyping"],
      },

      symbiosis: {
        date: "Apr 2026",
        category: "Flagship · On Hold",
        title: "Symbiosis AI",
        desc: "After surveying 80+ university students in Buenos Aires aged 17-28, I identified a constant frustration: the fear of becoming obsolete against the tools demanded by today's job market. SymbiosisAI was born to close that gap. It's not just a study platform, it's an ecosystem that teaches university material through programming and the use of real technology. It monitors progress in real time and adjusts the learning plan so that students don't just pass their courses, but master the tools that will make them competitive tomorrow.",
        tags: ["Python Backend", "LLM API Integration", "Streamlit UI", "RAG (Retrieval-Augmented Generation)"],
        comingSoonLabel: "On hold",
        clickHint: "Click to get notified",
      },

      zira: {
        date: "Aug 2026",
        category: "Hackathon · 24 hours",
        badge: "Aleph Hackathon",
        title: "ZIRA - AI Financial Reconciliation Agent",
        desc: "Built in 24 hours at the Aleph Hackathon. ZIRA is an AI agent that receives receipts from a local folder and runs OCR and matching 100% on-device against a bank CSV. It prioritizes alerting anomalies over failing silently, guaranteeing total privacy of sensitive financial data through decentralized QVAC technology.",
        tags: ["QVAC SDK", "Python", "Local UI"],
        links: {
          github: "", // TODO: paste the GitHub repo URL (already covered by the Proposal button)
          review: "", // TODO: paste the review/post URL
        },
      },

      oneiric: {
        date: "July 2026",
        category: "Hackathon · 1st edition",
        badge: "SideQuest Hackathon",
        title: "OneiricAi",
        desc: "Built in just 4 hours during the first edition of the SideQuest hackathon. OneiricAi was born from a problem we all know: almost everything we dream fades within minutes of waking up, and with it we lose ideas, scenes, and memories we would love to keep.\n\nThe platform integrates AI to reconstruct your dreams in video format from the context you provide, meaning the fragments you do remember when you wake up. That information is combined with biological patterns such as heart rate and sleep cycles, measured throughout the night by wearable devices like the Apple Watch.\n\nThat merge between your story and your biological data is what makes the product unique: the generated video is not an invention, it is a reconstruction backed by what your body recorded that night. These videos can be published directly from the app on Oneiric's built-in social network or shared to platforms like TikTok and Instagram. The key difference from other social networks is that you cannot lie or fake appearances here: every video is anchored to real biological data, which eliminates superficiality. That is why we call it 'The Healthy Social Network'.",
        tags: ["GenAI Video", "Biometrics", "Product Strategy", "Hackathon"],
      },

      nexstock: {
        date: "May 2026",
        category: "Processes & Operations",
        badge: "ITBA Bootcamp",
        title: "NexStock",
        desc: "Execution context\n• Business value proposition and model developed and validated in 3 days of intensive immersion.\n\nThe problem\n• SMBs selling across multiple channels —Mercado Libre, WhatsApp, Tienda Nube, in-store— can't sync their stock data in real time.\n• The result is overselling, cancellations, and silent losses of up to 10% of annual revenue.\n\nThe solution\n• Real-time synchronization of stock data across every sales channel for SMBs, with smart per-channel distribution and automatic supplier restocking.\n\nMy role\n• I led the team at the ITBA Entrepreneurs BootCamp 2026, within the Processes & Operations category (Pan American Silver).\n• I was in charge of market data analysis, product mockup design, structuring the business proposal, and coordinating the team to optimize time and get the idea ready to pitch.\n• We presented the solution to a jury made up of the CEO of Bianca, the Brand Experience Leader at Supervielle, and the Chief Innovation & Transformation Officer at Teleperformance.",
        tags: ["Product Strategy", "Data Analysis", "UX/UI", "Team Leadership"],
      },

      budgents: {
        date: "May 2025",
        category: "Automation - 3+ SMBs",
        title: "Budgents - AI Agents",
        role: "Co-Founder & Chief AI Architect",
        desc: "Building ecosystems to scale customer service without losing quality, freeing teams to focus on high-impact work. I evolved from Make to n8n to maximize technical flexibility and integrate more APIs. The solution automates first contact, lead qualification, and scheduling for SMBs and personal brands. Through webhooks and Supabase integration, all data is captured and organized automatically in real time for impeccable strategic follow-up.",
        tags: ["LLMs", "APIs", "Webhooks", "N8N"],
      },

      nutriops: {
        date: "Dec 2025",
        category: "Operations Research - Fitness",
        title: "NutriOps",
        desc: "One of my side-hustles is being a personal trainer, and many clients face the same problem: they don't know how to grocery shop efficiently to follow their nutrition plan without overspending. That's why I built NutriOps, a linear programming model that maximizes nutritional performance under budget constraints. The system is fed by a web scraping pipeline that extracts, in real time, prices and stock from the main supermarket chains in Buenos Aires. Through Excel Solver, the model processes this data to generate the optimal food combination at the lowest possible cost.",
        tags: ["Excel Solver", "Linear Programming", "Web Scraping", "Operations Research"],
      },

      imports: {
        date: "March 2025",
        category: "Imports - E-commerce",
        title: "Bellido Importaciones",
        role: "Founder & Operations Lead",
        desc: "What started in the perfumery niche evolved into a 100% on-demand retail import service, eliminating stock operating costs and maximizing capital efficiency. My core focus is connecting the United States market with the local audience, ensuring competitive prices through the analysis of international offers.\n\nMy value-add doesn't end there: I also optimize the acquisition of domestic products. I track the best local prices by contacting suppliers directly to avoid intermediary markups. I specialize in detecting savings opportunities across any category and negotiating advantageous conditions, achieving a real balance between strategic logistics and financial intelligence.",
        tags: ["Imports", "USA-LATAM", "Negotiation", "Logistics"],
      },

      asesoramientos: {
        date: "June 2023",
        category: "Coaching & Education",
        title: "Bellido Asesoramientos",
        role: "Founder",
        desc: "This project was born out of a personal need for progress and a natural vocation for teaching. I started by helping other young people take their first steps at the gym; what began as a search for my first income quickly transformed into a service with real results that led me to professionalize myself with IFBB certifications.\n\nIn this process, I identified a common problem: the most critical moment is the beginning. The lack of guidance when starting a habit or a subject is what usually leads to abandonment. That's why, in June 2023, I decided to expand this philosophy to the academic field to attack the same problem from another angle, applying an integral management approach with measurable results.\n\nStrategic Portfolio Management:\n• Integral client portfolio management: Strategic planning and short, medium, and long-term goal fulfillment to ensure the success of the process. (education/fitness)\n• User management and retention: Personalized follow-up to maximize plan adherence, achieving consistency through effective communication and continuous feedback. (education/fitness)\n• Results-oriented approach: Establishment of clear KPIs and weekly monitoring to guarantee constant progress and client satisfaction. (education/fitness)\n\nSupport and Data Intelligence:\n• Data-driven planning: Design and periodization of training mesocycles, adjusting volume and intensity variables according to physiological response and progress analysis. (fitness)\n• Initial process navigation: Service designed to help people navigate the beginning of their courses or routines, providing emotional support and motivation. (education/fitness)\n• Personalized planning: Creation of individual roadmaps adapted to each user's lifestyle and goals. (education/fitness)\n\nLeadership and Technical Mastery:\n• Management & Delegation: Leadership and coordination of a team of professionals to cover demand, strategically assigning them according to the profile and technical needs of the client. (education/fitness)\n• Advanced Technical Mastery: Personal teaching of subjects of high logical complexity (Mathematical Analysis, Linear Algebra and Descriptive Statistics). (education)\n• Transition Optimization: Guarantee of a smooth process between initial uncertainty and passing the subject or achieving the physical goal. (education/fitness)",
        tags: ["Team Leadership", "Client Management", "Mentoring", "Networking"],
       },

      modal: {
        title: "I want in",
        desc: "Symbiosis AI is on hold. Drop your email and I'll let you know when I pick it back up.",
        placeholder: "you@email.com",
        button: "Notify me",
      },
    },
    footer: {
      eyebrow: "Contact",
      title: "Let's Collaborate",
      desc: "Open to collaborations, events, and conversations about AI, Data, and Entrepreneurship.",
      emailLabel: "Email",
      locationLabel: "Location",
      location: "Buenos Aires, Argentina",
      role: "Actuary & Data Analyst",
      tagline: "AI, Automation, and Business Strategy",
      rights: "© 2026 Matías Rodrigo Bellido. All rights reserved.",
      form: {
        providerLabel: "Send with",
        nameLabel: "Name (optional)",
        namePlaceholder: "What's your name?",
        emailLabel: "Your email",
        emailPlaceholder: "you@email.com",
        messageLabel: "Message",
        messagePlaceholder: "Tell me how I can help...",
        submit: "Open in {provider}",
        hint: "{provider} opens with the subject and message ready: just hit Send.",
        opened: "Done: {provider} opened in a new tab.",
        subject: "Inquiry from your portfolio",
        greeting: "Hi Matías,",
        emailLine: "My email:",
      },
    },

    fitness: {
      whatsappMessage: "Hi Matías, I saw the Bellido Asesoramientos page. My goal is: ",
      nav: {
        links: [
          { id: "sobre-mi", label: "About" },
          { id: "resultados", label: "Results" },
          { id: "metodo", label: "Method" },
          { id: "empezar", label: "How to start" },
          { id: "planes", label: "Plans" },
          { id: "preguntas", label: "FAQ" },
        ],
        cta: "Message me",
        menu: "Open menu",
        close: "Close menu",
        home: "Go to the top of the page",
        lang: "Switch language to Spanish",
        langOther: "Español",
      },
      hero: {
        tagline: "Training with real criteria.",
        who: "For people who want to improve their body composition, performance or technique and can't keep their progress going.",
        method: ["Mesocycles based on your progress", "No banned foods", "Follow-up on WhatsApp"],
        cta: "Message me on WhatsApp",
        ctaSecondary: "See plans",
        photoAlt: "Matías Bellido training",
        loop: ["Plan", "Adjust", "Progress"],
      },
      audience: {
        eyebrow: "Who it's for",
        title: "For people who train and don't see the progress they want.",
        whoTitle: "It's for you if you want to",
        who: ["Improve your body composition", "Perform better in every session", "Improve your technique", "Be consistent"],
        problemsTitle: "What usually holds progress back",
        problems: [
          { title: "No planning", desc: "You train whatever comes up that day. Without a plan in stages, your body has no reason to keep adapting." },
          { title: "Plateaus", desc: "Your loads and the mirror haven't moved in months, even though you never skip the gym." },
          { title: "Restrictive diets", desc: "Plans that ban everything, that you drop after a few weeks and that take you back to square one." },
          { title: "Injuries from poor technique", desc: "Form nobody corrected, ending in aches or injuries that break your consistency." },
          { title: "No follow-up", desc: "Nobody asks how it went or adjusts the plan when something isn't working." },
        ],
        closing: "That's why I work with a plan in stages, adjusted to how you respond and followed closely.",
      },
      about: {
        eyebrow: "About me",
        title: "I started by helping others take their first steps at the gym.",
        paragraphs: [
          "I'm Matías Bellido. I started training in 2021 and got obsessed with building muscle, looking good and getting stronger. I trained day after day. A year later, already seeing results, I'd go to the gym and see guys who were just starting out and reminded me of myself when I began: motivated, but not knowing where to start.",
          "I'm passionate about fitness: eating well and following routines built around a goal. That led me to give them a hand: I helped them with their first routines and with understanding what they were doing and why.",
          "Over time I decided to specialize in bodybuilding, strength and different training methods, to help people reach their goals.",
          "Today, with Bellido Asesoramientos, I lead a team that helps me follow each person closely, online or in person.",
          "To date, more than 30 people have reached their physical goals with my personalized coaching.",
        ],
        photoAlt: "Matías Bellido",
        facts: [
          { label: "Training since", value: "2021" },
          { label: "Coaching clients since", value: "2023" },
          { label: "Format", value: "Online or in person" },
        ],
        certsTitle: "Certifications",
        certs: [
          "IFBB Academy — Personal Trainer / Bodybuilding Instructor",
          "ISSA — Certified Personal Trainer",
          "IFBB Academy — Cross Pro Fitness",
          "IFBB Academy — Sports Nutrition",
        ],
        certView: "View certificate",
        certNewTab: "(opens in a new tab)",
        certClose: "Close certificate",
        certAlt: "Certificate",
        certMissing: "Error 404",
        certMissingTitle: "Certificate coming soon",
        certMissingDesc: "The digital version of this certificate hasn't been published yet. In the meantime, you can view my other certifications.",
      },
      start: {
        eyebrow: "How to start",
        title: "From this message to your first session.",
        intro: "This is what happens after you message me, step by step.",
        freeCall: "Before you decide, you can have a free 1-on-1 call with me about your situation if you'd like.",
        stepLabel: "Step",
        steps: [
          { title: "Intake form", desc: "I send you a short form with your details, your history and your schedule. It's what I need to build a plan made for you.", when: "Right after you message me" },
          { title: "I review your goal", desc: "With your answers I look at what you want to achieve and where you're starting from: your goal and your current fitness.", when: "With the form" },
          { title: "Routine and nutrition", desc: "You get your personalized training routine and nutrition program.", when: "In about 2 days" },
          { title: "Follow-up on WhatsApp", desc: "Every time you train, I message you to ask how it went and adjust whatever's needed.", when: "After every session" },
        ],
        cta: "Message me on WhatsApp",
      },
      method: {
        eyebrow: "My method",
        title: "Planned, measured and adjusted to how you respond.",
        intro: "Before you start, it's important that you understand how I work, so there are no misunderstandings.",
        items: [
          { title: "Mesocycles", desc: "I split your training into blocks and adjust volume and intensity based on your physical response and the analysis of your progress." },
          { title: "No banned foods", desc: "I don't ban any food: I inform you and advise what's best for your situation. If you want to add something you like, I work it in." },
          { title: "Follow-up on WhatsApp", desc: "After every session I message you to ask how it went, improve your performance and keep you wanting to continue." },
          { title: "Online, honestly", desc: "Online, correcting your form is harder. That's why you can message me anytime and I'll send you a video that explains it." },
        ],
        sheet: {
          label: "Sample block",
          note: "Illustrative example: this is how the load goes up week by week within a mesocycle.",
          columns: ["Exercise", "Wk 1", "Wk 2", "Wk 3", "Wk 4"],
          rows: [
            { exercise: "Squat · kg", values: ["60", "62.5", "65", "67.5"] },
            { exercise: "Row · kg", values: ["40", "42.5", "42.5", "45"] },
            { exercise: "Plank · sec", values: ["30", "40", "45", "60"] },
          ],
        },
      },
      assimilation: {
        eyebrow: "Athlete assimilation",
        title: "Your first three months, stage by stage.",
        intro: "Personal training is a medium to long-term service. This is how the first months are organized, so you know exactly what I do and why.",
        monthLabel: "Month",
        months: [
          "I get to know your goal and your current fitness, and improve your exercise technique so the progress that follows is more efficient and faster.",
          "With your situation clearer, I spot your weak points to polish them, increase the loads and adjust your diet based on your performance.",
          "I start alternating strength and hypertrophy blocks to improve your performance and body composition, avoiding plateaus and possible injuries.",
        ],
      },
      results: {
        eyebrow: "Results",
        title: "Progress from people who train with me.",
        intro: "Before and after photos from clients, published with their permission.",
        before: "Before",
        after: "After",
        clientLabel: "Client",
        pending: "Photo coming soon",
        // How long each client's change took (from Matías, 2026-11-06). Empty = hidden.
        captions: ["16 weeks", "22 weeks", "12 weeks", "28 weeks"],
        disclaimer: "Photos published with each person's permission. Results depend on each person's starting point, consistency and time.",
        hint: "Drag the bar to compare before and after.",
        compare: "compare before and after",
        carouselLabel: "Client results: before and after",
        pause: "Pause the carousel",
        play: "Resume the carousel",
      },
      faq: {
        eyebrow: "FAQ",
        title: "What people usually ask me.",
        intro: "If something isn't clear, ask me as many times as you need.",
        groups: [
          {
            title: "Training",
            items: [
              { q: "What if I can't get an exercise right?", a: "Message me and I'll send you an explanatory video to help you." },
              { q: "What if I don't want to or can't go to the gym?", a: "Tell me why and I'll build a routine that fits your needs." },
              { q: "How many days a week do I have to train?", a: "You decide." },
              { q: "Can I ask as many questions as I want?", a: "Yes. If something wasn't clear, ask me as many times as you need." },
            ],
          },
          {
            title: "Nutrition",
            items: [
              { q: "Will you ban foods or alcohol?", a: "No. I give you recommendations, and following them is your decision." },
              { q: "Can the diet include supplements?", a: "Yes, if you ask me: I build your diet including natural supplementation as a resource." },
              { q: "Do I get cheat meals?", a: "Yes. There's no fixed number: tell me what you'd like and I'll tell you what fits your goals best." },
            ],
          },
        ],
      },
      plans: {
        eyebrow: "Services",
        title: "Choose how you want to train.",
        intro: "There are two ways to work with me. If you want to train with guidance, choose a pack: it adds guided sessions every month. If you'd rather train on your own with a plan made for you, choose an online plan.",
        tabsLabel: "Service type",
        priceFallback: "Ask for the price",
        billing: "per month",
        includes: "Includes",
        cta: "Ask on WhatsApp",
        message: "Hi Matías, I'm interested in the {plan}. My goal is: ",
        groups: [
          {
            id: "packs",
            label: "Packs",
            sublabel: "With guided sessions",
            desc: "Personalized coaching plus guided training sessions every month, online or in person. The packs differ in the number of sessions.",
            plans: [
              {
                id: "intensive",
                name: "Intensive Pack",
                highlight: "20 guided sessions a month",
                price: 395700,
                items: [
                  "Personalized 1-on-1 coaching",
                  "Personalized training routine",
                  "Personalized nutrition program",
                  "20 guided training sessions, online or in person",
                  "Early access to new products and services",
                  "Weekly video calls (optional)",
                  "Motivational support",
                  "Free recipe book",
                ],
              },
              {
                id: "discipline",
                name: "Discipline Pack",
                highlight: "15 guided sessions a month",
                price: 297300,
                items: [
                  "Personalized 1-on-1 coaching",
                  "Personalized training routine",
                  "Personalized nutrition program",
                  "15 guided training sessions, online or in person",
                  "Early access to new products and services",
                  "Weekly video calls (optional)",
                  "Motivational support",
                  "Free recipe book",
                ],
              },
              {
                id: "inicial",
                name: "Inicial Pack",
                highlight: "8 guided sessions a month",
                price: 181000,
                items: [
                  "Personalized 1-on-1 coaching",
                  "8 guided training sessions, online or in person",
                  "Personalized training routine and nutrition program",
                ],
              },
            ],
          },
          {
            id: "planes",
            label: "Online plans",
            sublabel: "You train on your own",
            desc: "You get your personalized plan and train on your own, without guided sessions. They go from the most complete to the simplest.",
            plans: [
              {
                id: "premium",
                name: "Premium Coaching",
                highlight: "Weekly video call + 1 session together a week",
                price: 36120,
                items: [
                  "Personalized 1-on-1 coaching",
                  "Personalized training routine",
                  "Personalized nutrition program",
                  "Weekly video calls",
                  "1 session a week together at my gym, if you want (doesn't carry over; subject to availability)",
                  "Free recipe book",
                  "5% off when you renew for the next month",
                ],
              },
              {
                id: "black",
                name: "Black Coaching",
                highlight: "Routine and nutrition + weekly video call",
                price: 31730,
                items: [
                  "Personalized 1-on-1 coaching",
                  "Personalized training routine",
                  "Personalized nutrition program",
                  "Weekly video calls",
                  "Free recipe book",
                  "2.3% off when you renew for the next month",
                ],
              },
              {
                id: "avanzado",
                name: "Advanced Coaching",
                highlight: "Personalized routine and nutrition",
                price: 29360,
                items: ["Personalized 1-on-1 coaching", "Personalized training routine", "Personalized nutrition program", "Free recipe book"],
              },
              {
                id: "rutina-alimentacion",
                name: "Routine and Nutrition Program",
                highlight: "Routine or nutrition: you choose one",
                price: 26770,
                items: ["Personalized 1-on-1 coaching", "Personalized training routine or nutrition program (you choose one)", "Free recipe book"],
              },
              {
                id: "rutinas-medida",
                name: "Custom Routines",
                highlight: "Basic routine, the most affordable option",
                price: 22180,
                items: ["Basic training routine for your goal", "Personalized 1-on-1 coaching"],
              },
            ],
          },
        ],
        inPerson: {
          id: "presencial",
          title: "In-person guided training",
          desc: "1-on-1 sessions at the gym. Add as many as you want to the cart or ask me about a class pack. Before you start I'll send you the terms and conditions.",
          price: 24700,
          unit: "per session",
          cta: "Ask about a pack",
          message: "Hi Matías, I'd like to ask about a pack of in-person sessions.",
        },
      },
      infoproducts: {
        eyebrow: "Infoproducts",
        title: "Material to understand what you're doing.",
        intro: "Guides to keep learning on your own, between sessions.",
        unit: "one-time payment",
        // Highest to lowest price (same order as Spanish)
        items: [
          { id: "anatomia", title: "Muscle anatomy", price: 24700, items: ["Biomechanics and science-based training tips to improve your results"] },
          { id: "alimentacion", title: "Healthy eating", price: 24700, items: ["Eating and nutrition tips", "Supplementation theory", "Scientific theory", "Hormonal changes from diet"] },
          { id: "recetario", title: "Recipe book", price: 15800, items: ["10+ healthy recipes that help you save time in the kitchen"] },
        ],
      },
      cart: {
        add: "🛒 Add to cart",
        inCart: "In your cart · View",
        open: "View cart",
        title: "Cart",
        close: "Close cart",
        steps: ["Cart", "Payment", "Form"],
        empty: "Your cart is empty.",
        emptyCta: "See plans and packs",
        remove: "Remove",
        less: "One session less",
        more: "One more session",
        total: "Total",
        monthNote: "Plans and packs are monthly: this payment covers the first month.",
        toPay: "Go to payment",
        payTitle: "Pay with Mercado Pago",
        payIntro: "Transfer exactly the total to Matías Rodrigo Bellido. Then come back to this page and tap \"I've paid\".",
        payButton: "Pay with Mercado Pago",
        qrLabel: "Or scan the QR code with the Mercado Pago app",
        aliasLabel: "Alias",
        cvuLabel: "CVU",
        nameLabel: "Account holder",
        copy: "Copy",
        copied: "Copied",
        paid: "I've paid",
        back: "Back to cart",
        doneTitle: "Thanks for your purchase!",
        doneDesc: "Last step: fill in the form so I can build your plan and send you what you bought.",
        formButton: "Fill in the form",
        formPending: "The form will be here very soon. Meanwhile, send me the receipt on WhatsApp and I'll pass it on.",
        receipt: "Send receipt on WhatsApp",
        receiptMessage: "Hi Matías, I've paid with Mercado Pago. I bought: {items}. Total: {total}.{extras} Sending you the receipt.",
        finish: "Done",
        codeLabel: "Discount code",
        referrerLabel: "Recommended by",
        removeExtra: "Remove",
        subtotal: "Subtotal",
        discount: "Discount",
        discountChip: "First month discounted",
        discountChipOnce: "Discounted",
        originalPrice: "Original price",
        finalPrice: "Discounted price",
        extrasCode: " Discount code: {code}.",
        extrasReferrer: " Recommended by: {name}.",
        units: { month: "per month", once: "one-time payment" },
      },
      affiliates: {
        eyebrow: "Affiliates",
        title: "Recommend the service and earn a commission.",
        intro: "For every person who signs up for the online service on your recommendation, you get part of the price of their plan.",
        firstValue: "25%",
        firstLabel: "of the first month's price",
        afterValue: "20%",
        afterLabel: "of the following months, as residual income",
        payout: "You get it paid into your account or taken off your next payment, so the service can end up free for you.",
        example: "Example: if you recommend a $100 plan, you get $25 for the first month.",
        cta: "I want to be an affiliate",
        message: "Hi Matías, I'd like to join the Bellido Asesoramientos affiliate program.",
        referral: {
          code: {
            title: "Discount code",
            desc: "If you have a code, enter it here. It is taken off everything you buy automatically (on plans and packs, off the first month), and you see it in your cart.",
            label: "Your code",
            placeholder: "Type it here",
            applied: "Code applied",
            invalid: "That code is not valid. Check it and try again.",
          },
          referrer: {
            title: "Affiliate",
            desc: "Did someone recommend this service to you? Write their name and it is noted with your purchase, so I can credit their recommendation.",
            label: "Name of the person who recommended you",
            placeholder: "First and last name",
          },
          save: "Save",
          saved: "Saved with your purchase",
          clear: "Remove",
        },
      },
      contact: {
        title: "Tell me your goal and I'll set your starting point.",
        desc: "Message me on WhatsApp with your situation. I'll tell you honestly whether I can help and which plan fits you.",
        cta: "Message me on WhatsApp",
        freeCall: "The first 1-on-1 call is free.",
        emailLabel: "Email rbellidomatias@gmail.com",
        email: "rbellidomatias@gmail.com",
      },
      footer: {
        back: "Go to my professional portfolio →",
        health: "Training does not replace medical advice. If you have an injury or persistent pain, check with a health professional first. Under 18: with permission from a parent or guardian.",
        rights: "© 2026 Matías Rodrigo Bellido · Bellido Asesoramientos",
        withdrawal: "Cancel my purchase",
        withdrawalMessage: "Hi Matías, I want to cancel my purchase (botón de arrepentimiento). My name is: ",
      },
    },
  },
};

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "es" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);