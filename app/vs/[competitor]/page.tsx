import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPARISONS, type ComparisonSlug } from "@/lib/comparison-data";

export function generateStaticParams() { return Object.keys(COMPARISONS).map((competitor) => ({ competitor })); }

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params;
  const item = COMPARISONS[competitor as ComparisonSlug];
  return item ? { title: `Inspire Ambitions vs ${item.name}`, description: `A factual comparison of Inspire Ambitions and ${item.name} for Gulf CV users.` } : {};
}

export default async function ComparisonPage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const item = COMPARISONS[competitor as ComparisonSlug];
  if (!item) notFound();
  const rows = [
    ["Gulf-specific personal and compliance fields", "Included", "Check the competitor workflow"],
    ["Arabic right-to-left CV layout", "Included", "Check the competitor workflow"],
    ["Free JPEG without email", "Included", "See official source"],
    ["Editable Word export", "Free after one email unlock", "See official source"],
    ["Deterministic job match score", "Included", "Check the competitor workflow"],
    ["Payment tier", "None", "See official source"],
  ];
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Inspire Ambitions CV Builder", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  return <main className="min-h-screen bg-[#faf9f6] px-5 py-14 text-[#1c1d1f]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><article className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase text-[#8a611f]">Checked 13 July 2026</p><h1 className="mt-3 text-4xl font-bold">Inspire Ambitions vs {item.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8">{item.summary}</p><div className="mt-8 border border-gray-300 bg-white p-5"><h2 className="text-lg font-bold">What the official source confirms</h2><p className="mt-2 leading-7">{item.fact}</p><a href={item.source} target="_blank" rel="noreferrer" className="mt-3 inline-block font-semibold text-[#8a611f] underline">{item.sourceLabel}</a></div><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[620px] border-collapse bg-white text-start"><thead><tr><th className="border p-3">Feature</th><th className="border p-3">Inspire Ambitions</th><th className="border p-3">{item.name}</th></tr></thead><tbody>{rows.map(([feature, ours, theirs]) => <tr key={feature}><td className="border p-3 font-semibold">{feature}</td><td className="border p-3">{ours}</td><td className="border p-3">{theirs}</td></tr>)}</tbody></table></div><p className="mt-6 text-sm leading-6 text-gray-600">Competitor products change. We link to their own source and avoid guessing where a current feature cannot be confirmed.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="bg-[#1c1d1f] px-5 py-3 font-semibold text-white">Build your CV</Link><Link href="/why-free" className="border border-gray-400 px-5 py-3 font-semibold">Why it is free</Link></div></article></main>;
}
