"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(
    authError ? "Не удалось войти. Попробуйте ещё раз." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Ссылка для входа отправлена на вашу почту.");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <label className="block">
        <span className="text-sm text-neutral-600">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1 w-full rounded-lg border-[0.5px] border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
        />
      </label>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            status === "error" || authError
              ? "text-red-700"
              : "text-neutral-600"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading" || status === "sent"}
        className="mt-6 w-full rounded-lg border-[0.5px] border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {status === "loading"
          ? "Отправка…"
          : status === "sent"
            ? "Письмо отправлено"
            : "Войти по ссылке"}
      </button>
    </form>
  );
}
