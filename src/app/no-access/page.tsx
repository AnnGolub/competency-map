import { SignOutButton } from "@/components/auth/sign-out-button";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-medium tracking-tight">Нет доступа</h1>
      <p className="mt-3 max-w-sm text-sm text-neutral-500">
        У вашего аккаунта нет роли lead или admin. Обратитесь к администратору,
        чтобы получить доступ к карте компетенций.
      </p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
