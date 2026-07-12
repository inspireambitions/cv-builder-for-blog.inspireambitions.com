import type { CVState } from "@/lib/types";

type PreviewProps = {
  template: CVState["template"];
};

const roles = {
  corp: "Transformation Director",
  min: "Senior Project Engineer",
  gulf: "Guest Experience Manager",
  cre: "Brand Partnerships Lead",
} satisfies Record<CVState["template"], string>;

function Lines({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <span className="block h-1.5 w-full bg-slate-300" />
      <span className="block h-1.5 w-11/12 bg-slate-200" />
      <span className="block h-1.5 w-4/5 bg-slate-200" />
    </div>
  );
}

export default function TemplatePreview({ template }: PreviewProps) {
  if (template === "corp") {
    return (
      <div className="h-full bg-white px-7 py-7 text-start text-slate-950" aria-hidden="true">
        <p className="font-serif text-[21px] leading-none">Nadia Rahman</p>
        <p className="mt-1 text-[8px] font-semibold uppercase text-navy-700">{roles.corp}</p>
        <p className="mt-3 border-y border-navy-200 py-1.5 text-[6px] text-slate-500">Dubai · +971 50 555 0184 · nadia@example.com</p>
        <p className="mt-1 text-[6px] font-semibold text-navy-700">Visa: Golden · Notice: 30 days · English &amp; Arabic</p>
        <div className="mt-5 grid grid-cols-[72px_1fr] gap-4">
          <p className="font-serif text-[9px] text-navy-800">Profile</p><Lines compact />
          <p className="font-serif text-[9px] text-navy-800">Experience</p>
          <div><p className="text-[7px] font-bold">Regional Transformation Director</p><p className="mb-2 text-[6px] text-slate-500">2021–Present · Dubai</p><Lines compact /></div>
        </div>
      </div>
    );
  }

  if (template === "gulf") {
    return (
      <div className="grid h-full grid-cols-[34%_66%] bg-white text-start text-slate-900" aria-hidden="true">
        <aside className="bg-[#eeeae2] px-4 py-6">
          <div className="mx-auto h-14 w-12 overflow-hidden rounded-sm bg-[#c7beb0]"><span className="mx-auto mt-3 block h-5 w-5 rounded-full bg-[#8f8578]" /><span className="mx-auto mt-1 block h-6 w-9 rounded-t-full bg-[#8f8578]" /></div>
          <p className="mt-4 text-[7px] font-bold uppercase text-[#514a42]">Work eligibility</p>
          <div className="mt-2 space-y-1 text-[6px] leading-tight text-[#675f56]"><p>Visa · Employment</p><p>Notice · 30 days</p><p>Location · Dubai</p><p>Licence · UAE valid</p></div>
          <p className="mt-5 text-[7px] font-bold uppercase text-[#514a42]">Languages</p>
          <p className="mt-1 text-[6px] text-[#675f56]">English · Fluent<br />Arabic · Conversational</p>
        </aside>
        <main className="px-5 py-7">
          <p className="text-[18px] font-bold leading-none text-[#24282a]">Nadia<br />Rahman</p>
          <p className="mt-2 text-[7px] font-semibold uppercase text-[#786b58]">{roles.gulf}</p>
          <p className="mt-3 text-[6px] text-slate-500">+971 50 555 0184 · nadia@example.com</p>
          <p className="mt-5 border-b border-[#b4aa9b] pb-1 text-[8px] font-bold uppercase">Profile</p><div className="mt-2"><Lines compact /></div>
          <p className="mt-5 border-b border-[#b4aa9b] pb-1 text-[8px] font-bold uppercase">Experience</p>
          <p className="mt-2 text-[7px] font-bold">Guest Experience Manager</p><p className="text-[6px] text-slate-500">Luxury hospitality group · Dubai</p><div className="mt-2"><Lines compact /></div>
        </main>
      </div>
    );
  }

  if (template === "min") {
    return (
      <div className="h-full bg-white px-7 py-7 text-start font-mono text-slate-900" aria-hidden="true">
        <div className="border-s-4 border-slate-900 ps-4"><p className="text-[17px] font-bold leading-none">NADIA RAHMAN</p><p className="mt-1 text-[7px] text-slate-500">{roles.min}</p></div>
        <p className="mt-4 text-[6px] text-slate-500">DUBAI / +971 50 555 0184 / nadia@example.com</p>
        <p className="mt-1 bg-slate-100 px-2 py-1.5 text-[6px]">VISA: EMPLOYMENT · NOTICE: 30D · UAE DL: VALID</p>
        <p className="mt-5 text-[8px] font-bold">01 / PROFILE</p><div className="mt-2 font-sans"><Lines compact /></div>
        <p className="mt-5 text-[8px] font-bold">02 / EXPERIENCE</p>
        <div className="mt-2 grid grid-cols-[62px_1fr] gap-3"><p className="text-[6px] text-slate-500">2021—NOW<br />DUBAI</p><div className="font-sans"><p className="text-[7px] font-bold">Senior Project Engineer</p><p className="mb-2 text-[6px] text-slate-500">Infrastructure consultancy</p><Lines compact /></div></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white px-7 py-7 text-start text-slate-950" aria-hidden="true">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[24px] font-black leading-[0.9]">Nadia<br />Rahman</p><p className="mt-2 text-[7px] font-bold uppercase text-emerald-800">{roles.cre}</p></div><div className="h-11 w-11 rounded-full bg-emerald-100" /></div>
      <p className="mt-4 border-b-2 border-emerald-700 pb-2 text-[6px] text-slate-500">Dubai · +971 50 555 0184 · nadia@example.com</p>
      <p className="mt-1 text-[6px] font-semibold text-emerald-800">Visa: Employment · Notice: 30 days · English &amp; Arabic</p>
      <div className="mt-5 grid grid-cols-[28px_1fr] gap-3"><p className="text-[9px] font-black text-emerald-700">01</p><div><p className="text-[9px] font-bold">Profile</p><div className="mt-2"><Lines compact /></div></div></div>
      <div className="mt-5 grid grid-cols-[28px_1fr] gap-3"><p className="text-[9px] font-black text-emerald-700">02</p><div><p className="text-[9px] font-bold">Experience</p><p className="mt-2 text-[7px] font-bold">Brand Partnerships Lead</p><p className="mb-2 text-[6px] text-slate-500">Regional media group · Dubai</p><Lines compact /></div></div>
    </div>
  );
}
