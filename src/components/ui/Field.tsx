import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass = (invalid: boolean) =>
  `block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
    invalid ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
  }`;

const ariaProps = (id: string, error?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

type ControlProps = { id: string; label: string; error?: string };

export function Input({
  id,
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return (
    <Field id={id} label={label} error={error}>
      <input id={id} className={controlClass(!!error)} {...ariaProps(id, error)} {...props} />
    </Field>
  );
}

export function Select({
  id,
  label,
  error,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & ControlProps) {
  return (
    <Field id={id} label={label} error={error}>
      <select id={id} className={controlClass(!!error)} {...ariaProps(id, error)} {...props} />
    </Field>
  );
}
