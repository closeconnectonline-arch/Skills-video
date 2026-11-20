"use client";
// Demo con tus fotos. Copia la carpeta img/ a public/avatares/ en tu proyecto Next.js.
import React from "react";
import { AnimatedTooltip } from "../ui/animated-tooltip";

const people = [
  { id: 1, name: "Integrante 1", designation: "Untitled crew", image: "/avatares/avatar-01.jpg" },
  { id: 2, name: "Integrante 2", designation: "Untitled crew", image: "/avatares/avatar-02.jpg" },
  { id: 3, name: "Integrante 3", designation: "Untitled crew", image: "/avatares/avatar-03.jpg" },
  { id: 4, name: "Integrante 4", designation: "Untitled crew", image: "/avatares/avatar-04.jpg" },
  { id: 5, name: "Integrante 5", designation: "Untitled crew", image: "/avatares/avatar-05.jpg" },
  { id: 6, name: "Integrante 6", designation: "Untitled crew", image: "/avatares/avatar-06.jpg" },
];

export function AnimatedTooltipPreview() {
  return (
    <div className="mb-10 flex w-full flex-row items-center justify-center">
      <AnimatedTooltip items={people} />
    </div>
  );
}
