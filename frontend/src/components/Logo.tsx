export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-orange-600" />
        <path d="M11 8h11v3.5h-7v3.5h6v3.5h-6V24h-4z" className="fill-white" />
      </svg>
      Foody
    </span>
  )
}
