import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Verified patient access</p>
        <h1 className="mt-2 font-display text-5xl">Sign in to the sanctuary</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Demo record: Eleanor Whitmore · eleanor@clarion.health · date of birth 14 March 1958.
        </p>
        <LoginForm />
      </div>
      <div className="photo-frame relative min-h-[420px]">
        <Image src="/images/senior-review.jpg" alt="Patient reviewing a medication bottle with a pharmacist" fill className="object-cover" />
      </div>
    </main>
  );
}
