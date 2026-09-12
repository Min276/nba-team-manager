"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectHydrated } from "@/lib/persistence";
import { loggedIn, selectUser } from "./authSlice";

const NAME_MIN = 2;
const NAME_MAX = 30;

function validateName(name: string) {
  if (!name) return "Please enter your name.";
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    return `Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
  }
}

export function LoginForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const hydrated = useAppSelector(selectHydrated);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [hydrated, user, router]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const message = validateName(trimmed);
    if (message) return setError(message);
    dispatch(loggedIn(trimmed));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input
        id="username"
        label="Username"
        autoComplete="username"
        placeholder="e.g. Min"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          setError(undefined);
        }}
      />
      <Button type="submit" className="w-full">
        Log in
      </Button>
    </form>
  );
}
