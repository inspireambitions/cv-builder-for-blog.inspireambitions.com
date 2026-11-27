"use client";

import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { CVState } from "./types";

export async function captureCV(draft: CVState) {
  const [{ default: renderCanvas }, { default: Template }] = await Promise.all([
    import("html2canvas-pro"),
    draft.template === "ats-clean"
      ? import("../components/templates/ATSCleanTemplate")
      : import("../components/templates/SectorTemplate"),
  ]);
  const host = document.createElement("div");
  host.className = "paper-surface";
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    inset: "0 auto auto -10000px",
    width: "794px",
    colorScheme: "light",
    pointerEvents: "none",
  });
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    // These are the same templates as the live preview. Each calls finishCV.
    flushSync(() => root.render(createElement(Template, { state: draft })));
    const paper = host.firstElementChild as HTMLElement | null;
    if (!paper) throw new Error("CV document did not render");
    paper.id = "cv-export-render";
    await document.fonts.ready;
    await Promise.all(Array.from(paper.querySelectorAll("img"), (image) => image.decode().catch(() => {})));
    return await renderCanvas(paper, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794 });
  } finally {
    root.unmount();
    host.remove();
  }
}
