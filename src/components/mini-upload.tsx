"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconUpload } from "@/components/icons";

export function MiniUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/prescriptions", { method: "POST", body });
    setBusy(false);
    if (res.ok) {
      const data = (await res.json()) as { id: number };
      router.push(`/prescriptions/upload?id=${data.id}`);
      router.refresh();
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-gold"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <IconUpload />
        {busy ? "Scanning…" : "Upload Rx"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      <Link href="/prescriptions/upload" className="sr-only">
        Open full prescription upload portal
      </Link>
    </div>
  );
}
