import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Welcome</h1>
      <p className="mt-1 mb-6 text-sm text-gray-600">Enter a username to get started.</p>
      <LoginForm />
    </div>
  );
}
