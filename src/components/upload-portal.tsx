"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Rx = {
  id: number;
  fileName: string;
  imagePath: string | null;
  ocrText: string | null;
  status: string;
  medicationName: string | null;
  dosage: string | null;
  prescriber: string | null;
  ndc: string | null;
};

export function UploadPortal({ initial }: { initial: Rx | null }) {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(initial ? 100 : 0);
  const [current, setCurrent] = useState(initial);
  const [message, setMessage] = useState("");

  async function send(file: File) {
    setProgress(12);
    setMessage("Encrypting image…");
    const body = new FormData();
    body.append("file", file);
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 11, 86));
    }, 180);
    const res = await fetch("/api/prescriptions", { method: "POST", body });
    clearInterval(tick);
    setProgress(100);
    if (!res.ok) {
      setMessage("Upload failed. Try a JPG or PNG.");
      return;
    }
    const data = (await res.json()) as Rx;
    setCurrent(data);
    setMessage("OCR complete. Please review the extracted slip.");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void send(file);
        }}
        className={`rounded-3xl border-2 border-dashed p-10 text-center ${drag ? "border-teal bg-cream" : "border-ink/20 bg-white"}`}
      >
        <p className="font-display text-2xl">Drop a doctor’s slip here</p>
        <p className="mt-2 text-ink-soft">JPG, PNG, or HEIC. We store only what the pharmacist needs.</p>
        <label className="btn btn-primary mt-5 inline-flex cursor-pointer">
          Choose file
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void send(file);
            }}
          />
        </label>
      </div>
      {progress > 0 ? (
        <div>
          <div className="h-3 overflow-hidden rounded-full bg-cream">
            <div className="h-full bg-teal" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm">{message || "Text-recognition in progress"}</p>
        </div>
      ) : null}
      {current ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.16em] text-ink-soft">OCR scan review</p>
          <h2 className="font-display text-3xl">{current.medicationName}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-soft">Prescriber</dt>
              <dd>{current.prescriber}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Directions</dt>
              <dd>{current.dosage}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">NDC</dt>
              <dd>{current.ndc}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Status</dt>
              <dd className="capitalize">{current.status}</dd>
            </div>
          </dl>
          <pre className="mt-4 overflow-auto rounded-2xl bg-cream p-4 text-sm">{current.ocrText}</pre>
          {current.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.imagePath} alt="Uploaded prescription slip" className="mt-4 max-h-64 rounded-2xl object-cover" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
