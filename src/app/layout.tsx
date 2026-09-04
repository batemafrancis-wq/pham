import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getPatient, getSessionId } from "@/lib/session";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-face",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Clarion Pharmacy — Clinical certainty, delivered",
  description:
    "HIPAA-aligned digital pharmacy for prescription upload, verified OTC, telehealth, and split HSA/FSA checkout.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureSeed();
  const [patient, sessionId] = await Promise.all([getPatient(), getSessionId()]);
  const cart = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} bg-paper text-ink antialiased`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header
          cartCount={cartCount}
          patientName={patient?.name ?? null}
        />
        <div id="main">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
