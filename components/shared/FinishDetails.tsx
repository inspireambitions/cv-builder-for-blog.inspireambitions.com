import { finishCV } from "@/lib/cv-finish";
import { useLocale } from "@/lib/locale";
import type { CVState } from "@/lib/types";

export default function FinishDetails({ draft }: { draft: CVState }) {
  const { t } = useLocale();
  const { changes } = finishCV(draft);
  if (!changes.length) return null;
  const kinds = [...new Set(changes.map(({ kind }) => kind))];

  return (
    <details className="mb-4 rounded-xl border border-gray-200 bg-white px-4 text-sm text-ink">
      <summary className="min-h-12 cursor-pointer py-3">
        {t(changes.length === 1 ? "review.finish.one" : "review.finish.many", { count: changes.length })}.{" "}
        <span className="underline">{t("review.finish.details")}</span>
      </summary>
      <ul className="list-disc space-y-1 pb-3 ps-5">
        {kinds.map((kind) => <li key={kind}>{t(`review.finish.${kind}`)}</li>)}
      </ul>
    </details>
  );
}
