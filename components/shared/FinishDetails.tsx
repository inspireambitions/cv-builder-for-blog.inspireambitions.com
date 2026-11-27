import { finishCV } from "@/lib/cv-finish";
import { useLocale } from "@/lib/locale";
import type { CVState } from "@/lib/types";

const copy = {
  en: {
    count: (n: number) => `We tidied ${n} ${n === 1 ? "thing" : "things"}`,
    details: "View details",
    "job-order": "Put recent jobs first.",
    "education-order": "Put recent qualifications first.",
    headline: "Used your latest job title for the heading, where available.",
    dates: "Used the same format for work dates.",
    bullet: "Tidied work bullets and kept up to six per job.",
    skills: "Tidied skill names and kept up to ten skills.",
    "empty-sections": "Left blank extra entries out of your CV.",
  },
  ar: {
    count: (n: number) => `عدد التعديلات على سيرتك الذاتية: ${n}`,
    details: "عرض التفاصيل",
    "job-order": "رتبنا الوظائف من الأحدث إلى الأقدم.",
    "education-order": "رتبنا المؤهلات من الأحدث إلى الأقدم.",
    headline: "استخدمنا مسمى آخر وظيفة في العنوان عند توفره.",
    dates: "وحدنا صيغة تواريخ العمل.",
    bullet: "راجعنا نقاط الخبرة وأبقينا ست نقاط كحد أقصى لكل وظيفة.",
    skills: "راجعنا أسماء المهارات وأبقينا عشر مهارات كحد أقصى.",
    "empty-sections": "لم نعرض الخانات الإضافية الفارغة في سيرتك الذاتية.",
  },
};

export default function FinishDetails({ draft }: { draft: CVState }) {
  const { locale } = useLocale();
  const { changes } = finishCV(draft);
  if (!changes.length) return null;
  const labels = copy[locale === "ar" ? "ar" : "en"];
  const kinds = [...new Set(changes.map(({ kind }) => kind))];

  return (
    <details className="mb-4 rounded-xl border border-gray-200 bg-white px-4 text-sm text-ink">
      <summary className="min-h-12 cursor-pointer py-3">
        {labels.count(changes.length)}. <span className="underline">{labels.details}</span>
      </summary>
      <ul className="list-disc space-y-1 pb-3 ps-5">
        {kinds.map((kind) => <li key={kind}>{labels[kind]}</li>)}
      </ul>
    </details>
  );
}
