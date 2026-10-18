"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="px-5 sm:px-6 md:px-16 py-14 md:py-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-cyan mb-4">
            {eyebrow}
          </p>
          <h2 className="font-display text-[clamp(2rem,8vw,3.75rem)] font-bold gradient-text leading-tight">
            {title}
          </h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}