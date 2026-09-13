import type { InputHTMLAttributes } from "react";

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { "aria-label": string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 3.36 9.86l3.14 3.14a.75.75 0 1 0 1.06-1.06l-3.14-3.14A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        {...props}
      />
    </div>
  );
}
