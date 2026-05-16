import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-medium tracking-tight">Competency Map</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Вход по magic link на корпоративную почту
        </p>
      </div>
      <div className="mt-10 w-full max-w-sm">
        <Suspense
          fallback={<p className="text-sm text-neutral-400">Загрузка…</p>}
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
