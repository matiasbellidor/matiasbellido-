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
  desc: string;
  tags: string[];
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
  longDesc: string;
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
    courses: string[];
    items: ExperienceItem[];
    education: EducationItem[];
  };
  projects: {
    eyebrow: string;
    title: string;
    sectionDesc: string;
    digitalSubtitle: string;
    businessSubtitle: string;
    symbiosis: {
      status: string;
      building: string;
      clickHint: string;
      meta: string;
      title: string;
      desc: string;
    };
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
    cta: string;
    tagline: string;
    rights: string;
  };
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
      badge: "Actuario & Data Scientist",
      location: "CABA, Argentina",
      titleLine1: "Hola! Soy",
      titleLine2: "Matías Bellido",
      desc: "Soy estudiante de Actuario y autodidacta en Data Science, enfocado en cerrar la brecha entre el análisis teórico y la ejecución práctica. Me mueve la curiosidad por emprender proyectos que desafíen lo convencional y el deseo constante de aprender. Creo en la capacidad de transformar problemas complejos en soluciones humanas y funcionales que tengan un impacto real.",
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
        "Creo que la teoría solo cobra sentido cuando se convierte en una solución. Soy estudiante de Actuario y autodidacta en Data Science porque me apasiona entender el por qué de las cosas, y me motiva mucho más construir el cómo. Mi enfoque es simple: combinar el rigor estadístico con distintas herramientas para que los datos dejen de ser ruido y pasen a ser decisiones estratégicas.",
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
          longDesc:
            "Foco académico en Métodos Cuantitativos, Estadística Matemática y Macroeconomía. Investigación independiente en Data Science y aplicación de algoritmos (Python/R) a modelos actuariales. Enfoque en la integración de modelos matemáticos con herramientas computacionales y análisis de procesos de negocio.\n\nProyecto Destacado: Matemática Aplicada I (Modelado Computacional)\n• Desarrollo de algoritmo en Python utilizando la librería NumPy para el cálculo automatizado de autovalores y autovectores.\n• Implementación práctica de conceptos de Álgebra Lineal para optimizar el análisis de matrices y sistemas de ecuaciones.\n\nProyecto Destacado: Sistemas Administrativos (Caso Real: Dar Sentido S.R.L.)\n• Consultoría de Procesos: Diagnóstico y rediseño del circuito de Abastecimiento/Compras en una Empresa B certificada, utilizando diagramas de interdependencia sectorial.\n• Gestión de Riesgos y Control Interno: Detección de falencias en la segregación de funciones y diseño de un nuevo marco de control preventivo y documental.\n• Análisis Organizacional: Evaluación de la estructura y mecanismos de coordinación para optimizar la toma de decisiones estratégicas.",
        },
        {
          period: "Mar 2018 - Nov 2023",
          institution: "Colegio Santa Teresa de Jesús",
          degree: "Bachiller en Ciencias Sociales y Humanidades",
          desc: "Formación humanista centrada en el pensamiento crítico y la conciencia social. Voluntariado en TECHO, deportes y actividades de acción social.",
          longDesc:
            "Formación humanista centrada en el pensamiento crítico y la conciencia social. Voluntariado en TECHO, deportes y actividades de acción social. Desarrollo de habilidades fundamentales que hoy complemento con mi formación técnica en Actuario y Ciencia de Datos.\n\nIniciativa y Ventas:\n• Para costear el viaje de egresados, me encargué de la venta de productos (tortas, rifas).\n• No me limité a vender mi parte; me ofrecí a gestionar y vender los productos de algunos compañeros para asegurar que todos llegaran al objetivo.\n• Fue mi primer contacto real con la venta y el trato con la gente.\n\nVoluntariado y Liderazgo:\n• Participación activa en proyectos sociales (TECHO).\n• Desarrollo de habilidades de trabajo en equipo, adaptabilidad en terreno y gestión de recursos bajo presión.\n\nHabilidades Blandas:\n• Comunicación efectiva y empatía como bases que hoy complemento con la formación técnica.",
        },
      ],
      courses: [
        "Introduction to Model Context Protocol - Anthropic",
        "Claude Platform 101 - Anthropic",
        "Claude Code in Action - Anthropic",
        "Data Science Intro - Santander Open Academy",
        "Finanzas - FEMSA",
        "Gestión Agile - Santander Open Academy",
        "Claude Code 101 - Anthropic",
        "Introduction to Claude Cowork - Anthropic",
        "Negociación - Santander Open Academy",
        "Storytelling - Santander Open Academy",
        "Claude 101: Everyday Work Tasks - Anthropic",
        "AI Fluency for Educators - Anthropic",
      ],
    },

    // ───────────────── SECCIÓN PROYECTOS ─────────────────
    projects: {
      eyebrow: "Work",
      title: "Proyectos",
      sectionDesc:
        "Mi enfoque profesional no se limita a una herramienta, sino a una mentalidad: la optimización de resultados. En este espacio conviven dos mundos que se retroalimentan. Por un lado, el desarrollo de soluciones tecnológicas y automatizaciones diseñadas para escalar procesos. Por el otro, la gestión estratégica de negocios y desarrollo humano, donde aplico la disciplina, el liderazgo de equipos y la optimización de recursos —ya sea en el ámbito académico, comercial o del rendimiento físico— para transformar objetivos en realidades medibles.",
      digitalSubtitle: "Soluciones Digitales & IA",
      businessSubtitle: "Operaciones de Negocio",

      symbiosis: {
        status: "Status",
        building: "Building",
        clickHint: "Click para recibir novedades",
        meta: "Abr 2026 - En desarrollo - Flagship",
        title: "Symbiosis AI",
        desc: "Tras encuestar a +80 estudiantes universitarios en CABA de entre 17-28 años, identifiqué una frustración constante: el miedo a quedar obsoletos frente a las herramientas que exige el mercado laboral actual. SymbiosisAI nace para cerrar esa brecha. No es solo una plataforma de estudio, es un ecosistema que enseña material de estudio universitario a través de la programación y el uso de tecnología real. Monitorea el progreso en tiempo real y ajusta el plan de aprendizaje para que el estudiante no solo apruebe sus materias, sino que domine las herramientas que lo harán competitivo el día de mañana.",
      },

      nexstock: {
        date: "Mayo 2026",
        category: "BootCamp ITBA · Procesos y Operaciones",
        title: "NexStock",
        desc: "Contexto de ejecución\n• Propuesta de valor y modelo de negocio desarrollados y validados en 3 días de inmersión intensiva.\n\nEl problema\n• Las PyMEs que venden en múltiples canales —Mercado Libre, WhatsApp, Tienda Nube, mostrador— no logran sincronizar su dato de stock en tiempo real.\n• El resultado son sobreventas, cancelaciones y pérdidas silenciosas de hasta el 10% de la facturación anual.\n\nLa solución\n• Sincronización del dato de stock de los distintos canales de venta en tiempo real para PyMEs, con distribución inteligente por canal y reposición automática con proveedores.\n\nMi rol\n• Lideré el equipo en el BootCamp Emprendedores ITBA 2026, dentro de la categoría Procesos y Operaciones (Pan American Silver).\n• Estuve a cargo del análisis de datos de mercado, el diseño de los mockups del producto, la estructuración de la propuesta de negocio y la coordinación del equipo para optimizar tiempos y llegar con la idea lista para vender.\n• Presentamos la solución ante un jurado integrado por el CEO de Bianca, la Brand Experience Leader de Supervielle y el Chief Innovation & Transformation Officer de Teleperformance.",
        tags: ["Product Strategy", "Data Analysis", "UX/UI", "Team Leadership"],
      },

      budgents: {
        date: "May 2025",
        category: "Automatización - +3 PYMEs",
        title: "Budgents - AI Agents",
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
        desc: "Lo que comenzó en el nicho de la perfumería evolucionó hacia un servicio de importaciones minoristas 100% bajo pedido, eliminando costos operativos de stock y maximizando la eficiencia del capital. Mi enfoque central es conectar el mercado de Estados Unidos con el público local, garantizando precios competitivos mediante el análisis de ofertas internacionales.\n\nMi valor agregado no termina ahí: también optimizo la adquisición de productos nacionales. Me encargo de rastrear los mejores precios locales contactando directamente con proveedores para evitar sobrecostos de intermediarios. Me especializo en detectar oportunidades de ahorro en cualquier categoría y negociar condiciones ventajosas, logrando un equilibrio real entre la logística estratégica y la inteligencia financiera.",
        tags: ["Importaciones", "USA-LATAM", "Negociación", "Logística"],
      },

      // ============ OPERACIONES DE NEGOCIO: BELLIDO ASESORAMIENTOS ============
      asesoramientos: {
        date: "Junio 2023",
        category: "Coaching & Educación",
        title: "Bellido Asesoramientos",
        desc: "Este proyecto nació de una necesidad personal de progreso y una vocación natural por la enseñanza. Comencé ayudando a otros jóvenes a dar sus primeros pasos en el gimnasio; lo que empezó como una búsqueda de mis primeros ingresos, se transformó rápidamente en un servicio con resultados reales que me llevó a profesionalizarme con certificaciones de la IFBB.\n\nEn este proceso, identifiqué una problemática común: el momento más crítico es el inicio. La falta de guía al empezar un hábito o una materia es lo que suele llevar al abandono. Por eso, en junio de 2023, decidí expandir esta filosofía al ámbito académico para atacar el mismo problema desde otro ángulo, aplicando un enfoque de gestión integral y resultados medibles.\n\nGestión Estratégica y Cartera:\n• Gestión integral de cartera de clientes: Planificación estratégica y cumplimiento de objetivos a corto, mediano y largo plazo para asegurar el éxito del proceso. (educación/fitness)\n• Gestión y retención de usuarios: Seguimiento personalizado para maximizar la adherencia al plan, logrando consistencia a través de comunicación efectiva y feedback continuo. (educación/fitness)\n• Enfoque orientado a resultados: Establecimiento de KPIs claros y monitoreo semanal para garantizar la evolución constante y la satisfacción del cliente. (educación/fitness)\n\nAcompañamiento e Inteligencia de Datos:\n• Planificación basada en datos: Diseño y periodización de mesociclos de entrenamiento, ajustando variables de volumen e intensidad según la respuesta fisiológica y el análisis de progreso. (fitness)\n• Navegación de procesos iniciales: Servicio diseñado para ayudar a las personas a transitar el comienzo de sus cursos o rutinas, brindando apoyo emocional y motivación. (educación/fitness)\n• Planificación personalizada: Creación de hojas de ruta individuales adaptadas al ritmo de vida y metas de cada usuario. (educación/fitness)\n\nLiderazgo y Dominio Técnico:\n• Gestión & Delegación: Liderazgo y coordinación de un equipo de profesionales para cubrir la demanda, asignándolos estratégicamente según el perfil y la necesidad técnica del cliente. (educación/fitness)\n• Dominio Técnico Avanzado: Dictado personal de materias de alta complejidad lógica (Análisis Matemático, Álgebra Lineal y Estadística Descriptiva). (educación)\n• Optimización de la Transición: Garantía de un proceso fluido entre la incertidumbre inicial y la aprobación de la materia o la consecución de la meta física. (educación/fitness)",
        tags: ["Liderazgo de equipos", "Gestión de clientes", "Mentorías", "Networking"],
      },

      modal: {
        title: "Quiero ser parte",
        desc: "Symbiosis AI está en construcción. Dejame tu email y te aviso cuando lance.",
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
      cta: "Colaboremos - Enviar Email",
      tagline: "Actuario & Data Scientist · IA, Automatización y Estrategia de Negocios",
      rights: "© 2026 Matías Rodrigo Bellido. Todos los derechos reservados.",
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
      badge: "Actuary & Data Scientist",
      location: "Buenos Aires, Argentina",
      titleLine1: "Hi! I'm",
      titleLine2: "Matías Bellido",
      desc: "I'm an Actuarial student and self-taught Data Scientist, focused on bridging the gap between theoretical analysis and practical execution. Driven by curiosity to take on unconventional projects and a constant desire to learn. I believe in transforming complex problems into human, functional solutions that create real impact.",
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
        "I believe theory only makes sense when it turns into a solution. I'm an Actuarial student and self-taught Data Scientist because I'm passionate about understanding the why of things, and even more motivated to build the how. My approach is simple: combine statistical rigor with different tools so that data stops being noise and becomes strategic decisions.",
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
          longDesc:
            "Academic focus on Quantitative Methods, Mathematical Statistics, and Macroeconomics. Independent research in Data Science and the application of algorithms (Python/R) to actuarial models. Focus on the integration of mathematical models with computational tools and business process analysis.\n\nFeatured Project: Applied Mathematics I (Computational Modeling)\n• Development of a Python algorithm using the NumPy library for the automated calculation of eigenvalues and eigenvectors.\n• Practical implementation of Linear Algebra concepts to optimize matrix and equation system analysis.\n\nFeatured Project: Administrative Systems (Real Case: Dar Sentido S.R.L.)\n• Process Consulting: Diagnosis and redesign of the Procurement circuit at a certified B Corp, using sectoral interdependence diagrams.\n• Risk Management and Internal Control: Detection of weaknesses in segregation of duties and design of a new preventive and documentary control framework.\n• Organizational Analysis: Evaluation of structure and coordination mechanisms to optimize strategic decision-making.",
        },
        {
          period: "Mar 2018 - Nov 2023",
          institution: "Santa Teresa de Jesús School",
          degree: "High School Diploma in Social Sciences and Humanities",
          desc: "Humanist education centered on critical thinking and social awareness. Volunteering at TECHO, sports, and social action activities.",
          longDesc:
            "Humanist education centered on critical thinking and social awareness. Volunteering at TECHO, sports, and social action activities. Development of foundational skills that I now complement with my technical training in Actuarial Science and Data Science.\n\nInitiative and Sales:\n• To pay for the senior class trip, I took charge of selling products (cakes, raffles).\n• I didn't limit myself to selling my own share; I offered to manage and sell my classmates' products to ensure everyone reached the goal.\n• It was my first real contact with sales and dealing with people.\n\nVolunteering and Leadership:\n• Active participation in social projects (TECHO).\n• Development of teamwork skills, field adaptability, and resource management under pressure.\n\nSoft Skills:\n• Effective communication and empathy as foundations that I now complement with technical training.",
        },
      ],
      courses: [
        "Introduction to Model Context Protocol - Anthropic",
        "Claude Platform 101 - Anthropic",
        "Claude Code in Action - Anthropic",
        "Data Science Intro - Santander Open Academy",
        "Finance - FEMSA",
        "Agile Management - Santander Open Academy",
        "Claude Code 101 - Anthropic",
        "Introduction to Claude Cowork - Anthropic",
        "Negotiation - Santander Open Academy",
        "Storytelling - Santander Open Academy",
        "Claude 101: Everyday Work Tasks - Anthropic",
        "AI Fluency for Educators - Anthropic",
      ],
    },
    projects: {
      eyebrow: "Work",
      title: "Projects",
      sectionDesc:
        "My professional approach is not limited to one tool, but to a mindset: results optimization. In this space, two mutually reinforcing worlds coexist. On one side, the development of technological solutions and automations designed to scale processes. On the other, the strategic management of business and human development, where I apply discipline, team leadership, and resource optimization —whether in the academic, commercial, or physical performance domain— to transform objectives into measurable realities.",
      digitalSubtitle: "Digital Solutions & AI",
      businessSubtitle: "Business Ops & Logic Models",

      symbiosis: {
        status: "Status",
        building: "Building",
        clickHint: "Click to receive updates",
        meta: "Apr 2026 - In development - Flagship",
        title: "Symbiosis AI",
        desc: "After surveying 80+ university students in Buenos Aires aged 17-28, I identified a constant frustration: the fear of becoming obsolete against the tools demanded by today's job market. SymbiosisAI was born to close that gap. It's not just a study platform, it's an ecosystem that teaches university material through programming and the use of real technology. It monitors progress in real time and adjusts the learning plan so that students don't just pass their courses, but master the tools that will make them competitive tomorrow.",
      },

      nexstock: {
        date: "May 2026",
        category: "ITBA BootCamp · Operations",
        title: "NexStock",
        desc: "Execution context\n• Business value proposition and model developed and validated in 3 days of intensive immersion.\n\nThe problem\n• SMBs selling across multiple channels —Mercado Libre, WhatsApp, Tienda Nube, in-store— can't sync their stock data in real time.\n• The result is overselling, cancellations, and silent losses of up to 10% of annual revenue.\n\nThe solution\n• Real-time synchronization of stock data across every sales channel for SMBs, with smart per-channel distribution and automatic supplier restocking.\n\nMy role\n• I led the team at the ITBA Entrepreneurs BootCamp 2026, within the Processes & Operations category (Pan American Silver).\n• I was in charge of market data analysis, product mockup design, structuring the business proposal, and coordinating the team to optimize time and get the idea ready to pitch.\n• We presented the solution to a jury made up of the CEO of Bianca, the Brand Experience Leader at Supervielle, and the Chief Innovation & Transformation Officer at Teleperformance.",
        tags: ["Product Strategy", "Data Analysis", "UX/UI", "Team Leadership"],
      },

      budgents: {
        date: "May 2025",
        category: "Automation - 3+ SMBs",
        title: "Budgents - AI Agents",
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
        desc: "What started in the perfumery niche evolved into a 100% on-demand retail import service, eliminating stock operating costs and maximizing capital efficiency. My core focus is connecting the United States market with the local audience, ensuring competitive prices through the analysis of international offers.\n\nMy value-add doesn't end there: I also optimize the acquisition of domestic products. I track the best local prices by contacting suppliers directly to avoid intermediary markups. I specialize in detecting savings opportunities across any category and negotiating advantageous conditions, achieving a real balance between strategic logistics and financial intelligence.",
        tags: ["Imports", "USA-LATAM", "Negotiation", "Logistics"],
      },

      asesoramientos: {
        date: "June 2023",
        category: "Coaching & Education",
        title: "Bellido Asesoramientos",
        desc: "This project was born out of a personal need for progress and a natural vocation for teaching. I started by helping other young people take their first steps at the gym; what began as a search for my first income quickly transformed into a service with real results that led me to professionalize myself with IFBB certifications.\n\nIn this process, I identified a common problem: the most critical moment is the beginning. The lack of guidance when starting a habit or a subject is what usually leads to abandonment. That's why, in June 2023, I decided to expand this philosophy to the academic field to attack the same problem from another angle, applying an integral management approach with measurable results.\n\nStrategic Portfolio Management:\n• Integral client portfolio management: Strategic planning and short, medium, and long-term goal fulfillment to ensure the success of the process. (education/fitness)\n• User management and retention: Personalized follow-up to maximize plan adherence, achieving consistency through effective communication and continuous feedback. (education/fitness)\n• Results-oriented approach: Establishment of clear KPIs and weekly monitoring to guarantee constant progress and client satisfaction. (education/fitness)\n\nSupport and Data Intelligence:\n• Data-driven planning: Design and periodization of training mesocycles, adjusting volume and intensity variables according to physiological response and progress analysis. (fitness)\n• Initial process navigation: Service designed to help people navigate the beginning of their courses or routines, providing emotional support and motivation. (education/fitness)\n• Personalized planning: Creation of individual roadmaps adapted to each user's lifestyle and goals. (education/fitness)\n\nLeadership and Technical Mastery:\n• Management & Delegation: Leadership and coordination of a team of professionals to cover demand, strategically assigning them according to the profile and technical needs of the client. (education/fitness)\n• Advanced Technical Mastery: Personal teaching of subjects of high logical complexity (Mathematical Analysis, Linear Algebra and Descriptive Statistics). (education)\n• Transition Optimization: Guarantee of a smooth process between initial uncertainty and passing the subject or achieving the physical goal. (education/fitness)",
        tags: ["Team Leadership", "Client Management", "Mentoring", "Networking"],
       },

      modal: {
        title: "I want in",
        desc: "Symbiosis AI is under construction. Drop your email and I'll let you know when it launches.",
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
      cta: "Let's Collaborate - Send Email",
      tagline: "Actuary & Data Scientist · AI, Automation, and Business Strategy",
      rights: "© 2026 Matías Rodrigo Bellido. All rights reserved.",
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