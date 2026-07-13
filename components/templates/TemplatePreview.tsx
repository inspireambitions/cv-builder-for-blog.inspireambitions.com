import type { CVState } from "@/lib/types";
import { TEMPLATE_CONFIG } from "@/lib/template-config";

type PreviewProps = { template: CVState["template"] };

function Lines() {
  return (
    <div className="space-y-1">
      <span className="block h-1.5 w-full bg-slate-300" />
      <span className="block h-1.5 w-11/12 bg-slate-200" />
      <span className="block h-1.5 w-4/5 bg-slate-200" />
    </div>
  );
}

export default function TemplatePreview({ template }: PreviewProps) {
  const config = TEMPLATE_CONFIG[template];
  const sidebar = config.sidebar;

  return (
    <div className="h-full bg-white text-start text-slate-950" aria-hidden="true">
      <header className="px-6 py-5 text-white" style={{ background: config.accent }}>
        <p className="text-[6px] font-bold uppercase tracking-widest opacity-80">{config.eyebrow}</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <p className={`text-[20px] font-bold leading-none ${config.heading === "serif" ? "font-serif" : ""}`}>Nadia Rahman</p>
            <p className="mt-1 text-[7px] font-semibold uppercase opacity-85">Regional Operations Leader</p>
          </div>
          {config.photo !== "hidden" && <div className="h-11 w-10 bg-white/30" style={{ borderRadius: config.photo === "prominent" ? 3 : 999 }} />}
        </div>
        <p className="mt-3 text-[6px] opacity-85">Dubai | +971 50 555 0184 | nadia@example.com</p>
      </header>
      <div className={sidebar ? "grid h-full grid-cols-[68%_32%]" : "px-6 py-5"}>
        <main className={sidebar ? "px-5 py-5" : ""}>
          <p className="border-b pb-1 text-[8px] font-bold uppercase" style={{ borderColor: config.accent, color: config.accent }}>Professional profile</p>
          <div className="mt-2"><Lines /></div>
          <p className="mt-5 border-b pb-1 text-[8px] font-bold uppercase" style={{ borderColor: config.accent, color: config.accent }}>Experience</p>
          <p className="mt-2 text-[7px] font-bold">Regional Operations Manager</p>
          <p className="mb-2 text-[6px] text-slate-500">Leading UAE employer | 2021 to present</p>
          <Lines />
          <div className="mt-4"><Lines /></div>
        </main>
        {sidebar && (
          <aside className="h-full px-3 py-5" style={{ background: config.soft }}>
            <p className="text-[7px] font-bold uppercase" style={{ color: config.accent }}>Expertise</p>
            <p className="mt-2 text-[6px] leading-4 text-slate-600">Operations<br />Stakeholders<br />Compliance<br />Team leadership</p>
            <p className="mt-5 text-[7px] font-bold uppercase" style={{ color: config.accent }}>Languages</p>
            <p className="mt-2 text-[6px] leading-4 text-slate-600">English<br />Arabic</p>
          </aside>
        )}
      </div>
    </div>
  );
}
