"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(form: FormData) {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        dateOfBirth: form.get("dateOfBirth"),
      }),
    });
    if (!res.ok) {
      setError("Those credentials did not match a verified patient.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-4 rounded-3xl bg-white p-6" action={(form) => void onSubmit(form)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required defaultValue="eleanor@clarion.health" />
      </div>
      <div>
        <label htmlFor="dob">Date of birth</label>
        <input id="dob" name="dateOfBirth" type="date" required defaultValue="1958-03-14" />
      </div>
      {error ? <p className="text-alert">{error}</p> : null}
      <button className="btn btn-primary w-full" type="submit">
        Match identity
      </button>
      <button className="btn btn-ghost w-full" type="button" onClick={() => void logout()}>
        Sign out
      </button>
    </form>
  );
}
