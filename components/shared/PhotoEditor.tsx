"use client";

import { useRef, useState } from "react";
import { useCVState } from "@/lib/state";
import { TEMPLATE_CONFIG } from "@/lib/template-config";
import { validateImageUpload } from "@/lib/validators";
import { analysePhotoQuality, cropPhoto, type PhotoCheck } from "@/lib/photo-quality";

type NormalisedImage = {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
};

export default function PhotoEditor({ compact = false }: { compact?: boolean }) {
  const { state, updateField } = useCVState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<NormalisedImage | null>(null);
  const [checks, setChecks] = useState<PhotoCheck[]>([]);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(42);
  const [zoom, setZoom] = useState(1.15);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = TEMPLATE_CONFIG[state.template];
  const includePhoto = state.photoPreference === "photo";

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setError(validation.error ?? "Choose a supported image.");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/normalise-image", { method: "POST", body: formData });
      const result = (await response.json()) as Partial<NormalisedImage> & { error?: string };
      if (!response.ok || typeof result.dataUrl !== "string") {
        throw new Error(result.error || "The photo could not be prepared.");
      }
      const image = {
        dataUrl: result.dataUrl,
        originalWidth: result.originalWidth ?? 0,
        originalHeight: result.originalHeight ?? 0,
      };
      setPending(image);
      setPositionX(50);
      setPositionY(42);
      setZoom(1.15);
      setChecks(await analysePhotoQuality(image.dataUrl, {
        originalWidth: image.originalWidth,
        originalHeight: image.originalHeight,
        fileSize: file.size,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The photo could not be prepared.");
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  }

  async function saveCrop() {
    if (!pending) return;
    setProcessing(true);
    setError(null);
    try {
      updateField({
        photo: await cropPhoto(pending.dataUrl, positionX, positionY, zoom),
        photoPreference: "photo",
      });
      setPending(null);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "The crop could not be saved.");
    } finally {
      setProcessing(false);
    }
  }

  function removePhoto() {
    updateField({ photo: null, photoPreference: "photo-free" });
    setPending(null);
    setChecks([]);
    setError(null);
  }

  const previewRadius = config.photo === "prominent" ? "rounded-lg" : "rounded-full";

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white ${compact ? "p-4" : "p-5"}`} aria-labelledby="photo-heading">
      <div>
        <h3 id="photo-heading" className="text-base font-semibold text-gray-900">Professional photo</h3>
        <p className="mt-1 text-sm leading-6 text-gray-600">Choose whether this CV should show your photo.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" aria-pressed={includePhoto} onClick={() => updateField({ photoPreference: "photo" })} className={`min-h-12 rounded-xl border px-4 text-start text-sm font-semibold ${includePhoto ? "border-[#806017] bg-[#faf7ee] text-[#6f5314] ring-2 ring-[#806017]/20" : "border-gray-300 text-gray-700"}`}>
          Include a photo
        </button>
        <button type="button" aria-pressed={!includePhoto} onClick={() => updateField({ photoPreference: "photo-free" })} className={`min-h-12 rounded-xl border px-4 text-start text-sm font-semibold ${!includePhoto ? "border-[#1a2744] bg-slate-50 text-[#1a2744] ring-2 ring-[#1a2744]/15" : "border-gray-300 text-gray-700"}`}>
          Use a photo-free CV
        </button>
      </div>

      {!includePhoto && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Photo-free CVs are often preferred by multinational employers and for applications outside the GCC.
        </p>
      )}

      {includePhoto && config.photo === "hidden" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="status">
          The {config.id} template hides photos. Your image will stay saved, but it will not appear until you choose a photo-enabled design.
        </p>
      )}

      {includePhoto && !pending && (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={processing} className={`flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-gray-500 hover:border-[#806017] ${previewRadius}`}>
            {state.photo ? (
              // A local data URL cannot use the Next.js image optimiser.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.photo} alt="Current professional photo" className="h-full w-full object-cover" />
            ) : processing ? "Preparing..." : "Upload photo"}
          </button>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} disabled={processing} className="min-h-10 rounded-lg bg-[#1a2744] px-4 text-sm font-semibold text-white disabled:opacity-60">
                {state.photo ? "Replace photo" : "Choose photo"}
              </button>
              {state.photo && <button type="button" onClick={removePhoto} className="min-h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">Remove photo</button>}
            </div>
            <p className="text-xs leading-5 text-gray-500">JPG, PNG, WEBP, HEIC or HEIF. Maximum 5 MB. EXIF metadata is removed.</p>
          </div>
        </div>
      )}

      {includePhoto && pending && (
        <div className="mt-5 space-y-5">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <div className={`relative mx-auto h-52 w-52 overflow-hidden border-4 border-white bg-slate-100 shadow-lg ${previewRadius}`} aria-label="Photo crop preview">
                {/* A local data URL cannot use the Next.js image optimiser. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pending.dataUrl} alt="Photo awaiting crop" className="h-full w-full object-cover" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})` }} />
                <span className="pointer-events-none absolute inset-[18%] rounded-[45%] border border-dashed border-white/90" aria-hidden="true" />
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">Keep your head and shoulders inside the guide.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Move left or right
                <input type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-semibold text-gray-700">Move up or down
                <input type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-semibold text-gray-700">Zoom
                <input type="range" min="1" max="2.4" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={saveCrop} disabled={processing} className="min-h-11 rounded-lg bg-[#806017] px-5 text-sm font-semibold text-white disabled:opacity-60">{processing ? "Saving..." : "Save crop"}</button>
                <button type="button" onClick={() => setPending(null)} className="min-h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700">Cancel</button>
              </div>
            </div>
          </div>

          {checks.length > 0 && (
            <div aria-label="Photo quality checks">
              <h4 className="text-sm font-semibold text-gray-900">Photo quality check</h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {checks.map((check) => (
                  <div key={check.id} className={`rounded-lg border p-3 text-xs leading-5 ${check.status === "pass" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "warning" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                    <strong>{check.status === "pass" ? "Pass" : check.status === "warning" ? "Review" : "Guide"}: {check.label}</strong>
                    <p>{check.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {includePhoto && (
        <div className="mt-5 rounded-xl bg-[#eef7f4] p-4 text-sm leading-6 text-[#285c4d]">
          Use a recent head-and-shoulders portrait. Choose a plain background and professional clothing. Avoid filters and passport scans.
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" onChange={handleUpload} className="sr-only" aria-label="Choose professional photo file" />
    </section>
  );
}
