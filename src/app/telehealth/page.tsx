import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { consultations, messages } from "@/db/schema";
import { getSessionId } from "@/lib/session";
import { ChatLounge } from "@/components/chat-lounge";
import { BookingMatrix } from "@/components/booking-matrix";

export const dynamic = "force-dynamic";

export default async function TelehealthPage() {
  const sessionId = await getSessionId();
  const existing =
    (
      await db
        .select()
        .from(consultations)
        .where(eq(consultations.sessionId, sessionId))
        .orderBy(desc(consultations.createdAt))
        .limit(1)
    )[0] ?? null;
  const thread = existing
    ? await db.select().from(messages).where(eq(messages.consultationId, existing.id))
    : [];
  const bookings = await db.select().from(consultations).where(eq(consultations.sessionId, sessionId));

  return (
    <main>
      <section className="relative min-h-[42vh] overflow-hidden bg-ink text-cream">
        <Image
          src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80"
          alt="Clinician on a telehealth video call"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <p className="text-sm uppercase tracking-[0.18em]">Secure telehealth & consultation lounge</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl md:text-6xl">Talk to a pharmacist without leaving the record.</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl">Pharmacist on-demand chat</h2>
          <p className="mt-2 text-lg text-ink-soft">
            Messages stay inside this encrypted workspace. A licensed pharmacist replies in the sandbox with clinical, non-diagnostic guidance.
          </p>
          <ChatLounge
            consultationId={existing?.id ?? null}
            messages={thread.map((m) => ({
              id: m.id,
              sender: m.sender,
              body: m.body,
            }))}
          />
        </div>
        <div>
          <h2 className="font-display text-4xl">Virtual clinical booking</h2>
          <p className="mt-2 text-lg text-ink-soft">Select a 20-minute video block. Priya Raman, PharmD, BCPS holds the afternoon clinic.</p>
          <div className="relative mb-6 mt-6 h-52 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895977?auto=format&fit=crop&w=1200&q=80"
              alt="Pharmacist at a laptop during clinic hours"
              fill
              className="object-cover"
            />
          </div>
          <BookingMatrix
            bookings={bookings
              .filter((b) => b.type === "video")
              .map((b) => ({ id: b.id, scheduledAt: b.scheduledAt, topic: b.topic, status: b.status }))}
          />
        </div>
      </section>
    </main>
  );
}
