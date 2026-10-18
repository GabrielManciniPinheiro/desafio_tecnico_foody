import { useId, type ComponentProps } from 'react'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-xs outline-none transition focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-100'
            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-100'
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
