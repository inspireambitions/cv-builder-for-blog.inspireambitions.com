import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import { handleTalkRequest } from "../lib/talk-server";
import { translateTalkCatalogueInput } from "../lib/talk-translation-evidence";

const english = [
  "Cleaned guest rooms.",
  "Used cleaning products and equipment in line with safety instructions.",
];

const examples = {
  ar: [
    "نظّفت غرف الضيوف.",
    "استخدمت مواد التنظيف والمعدات وفق تعليمات السلامة.",
  ],
  hi: [
    "मेहमानों के कमरे साफ़ किए।",
    "सफ़ाई के उत्पादों और उपकरणों का सुरक्षा निर्देशों के अनुसार इस्तेमाल किया।",
  ],
  ur: [
    "مہمانوں کے کمرے صاف کیے۔",
    "صفائی کی مصنوعات اور آلات کو حفاظتی ہدایات کے مطابق استعمال کیا۔",
  ],
  tl: [
    "Nilinis ang mga kuwarto ng bisita.",
    "Gumamit ng mga panlinis at kagamitan ayon sa mga tagubilin sa kaligtasan.",
  ],
} as const;

test("matched catalogue claims return translated bullets in source order for candidate review", () => {
  for (const inputLang of ["ar", "hi", "ur", "tl"] as const) {
    const sourceLines = examples[inputLang].map((line) => `• ${line.normalize("NFD")}`);
    expect(translateTalkCatalogueInput("housekeeping", inputLang, sourceLines.join("\r\n"))).toEqual({
      bullets: english,
      sourceLines,
    });
  }
});

test("translation rejects all lines if a line adds a fact, drops a qualifier, mixes language or hides characters", () => {
  const [first, second] = examples.tl;
  const source = `${first}\n${second}`;
  for (const unsafe of [
    `${first}\n${second} Lumipat ako noong 2021.`,
    `${first}\n${second.replace("ayon sa mga tagubilin sa kaligtasan", "")}`,
    `${first}\n${english[1]}`,
    `${first}\n${first}`,
    `\ufeff${source}`,
    `${source}\u202E`,
  ]) {
    expect(translateTalkCatalogueInput("housekeeping", "tl", unsafe)).toBeNull();
  }
  expect(translateTalkCatalogueInput("finance", "tl", source)).toBeNull();
  expect(translateTalkCatalogueInput("housekeeping", "tl", "Gumamit ng panlinis at kagamitan ayon sa mga tagubilin sa kaligtasan.")).toBeNull();
});

test("the Talk route rejects ungrounded translation instead of falling back to the model", async () => {
  const previous = process.env.NEXT_PUBLIC_TALK_MODE;
  process.env.NEXT_PUBLIC_TALK_MODE = "true";
  try {
    const send = (source: string) => handleTalkRequest(
      new NextRequest("http://127.0.0.1/api/talk/bullets", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "192.0.2.61" },
        body: JSON.stringify({ familyKey: "housekeeping", inputLang: "ar", jobTitle: "Fixture only", text: source }),
      }),
      "bullets",
    );
    const source = examples.ar.join("\n");
    const accepted = await send(source);
    expect(accepted.status).toBe(200);
    expect(accepted.headers.get("cache-control")).toBe("no-store");
    expect(await accepted.json()).toEqual({
      bullets: english, sourceLines: [...examples.ar], method: "catalogue_translation",
    });
    for (const unsupported of [`${source}\nEnglish added claim.`, `\ufeff${source}`]) {
      const rejected = await send(unsupported);
      expect(rejected.status).toBe(422);
      expect(await rejected.json()).toMatchObject({ code: "unsupported_translation" });
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_TALK_MODE;
    else process.env.NEXT_PUBLIC_TALK_MODE = previous;
  }
});
