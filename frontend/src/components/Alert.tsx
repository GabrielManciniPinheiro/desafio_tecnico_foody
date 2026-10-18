export function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  )
}

export function SlowServerHint({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <p className="animate-delayed-appear text-center text-xs text-slate-500 opacity-0">
      O servidor pode levar até um minuto para responder no primeiro acesso.
    </p>
  )
}
