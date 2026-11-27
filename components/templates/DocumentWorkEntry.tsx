import type { ExpEntry } from "@/lib/types";

export default function DocumentWorkEntry({ item, note }: { item: ExpEntry; note: string }) {
  const meta = [item.location, item.dates].filter(Boolean).join(" | ");
  return (
    <article className="document-work-entry">
      <div><strong><bdi>{item.role}</bdi></strong>{item.company && <span>{item.role ? ", " : ""}<bdi>{item.company}</bdi></span>}</div>
      {meta && <div className="document-work-meta"><bdi>{meta}</bdi></div>}
      {item.companyDesc && <div className="document-work-meta"><bdi>{item.companyDesc}</bdi></div>}
      {item.description && <ul>{item.description.split("\n").filter(Boolean).map((line, index) => <li key={index} dir="auto">{line}</li>)}</ul>}
      {item.gap && <div className="document-work-meta"><strong>{note}:</strong> <bdi>{item.gap}</bdi></div>}
    </article>
  );
}
