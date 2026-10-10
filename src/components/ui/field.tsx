import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

function invalidClass(invalid: boolean | undefined): string {
  return invalid ? ' field-invalid' : '';
}

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (control: { id: string; 'aria-invalid': boolean }) => ReactNode;
}

/**
 * Wraps a control and owns its `id`, so label, hint and error message stay wired
 * to the input no matter how the layout changes.
 */
export function Field({ label, htmlFor, hint, error, required, className = '', children }: FieldProps) {
  const generated = useId();
  const id = htmlFor ?? generated;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink-muted">
        {label}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      <div aria-describedby={describedBy}>{children({ id, 'aria-invalid': Boolean(error) })}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={['field', invalidClass(invalid), className].join(' ')}
      {...rest}
    />
  );
});

export interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className = '', children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={['field appearance-none bg-no-repeat pr-8', invalidClass(invalid), className].join(' ')}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%238a94a6' stroke-width='2'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1rem 1rem',
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className = '', rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={['field resize-y', invalidClass(invalid), className].join(' ')}
      {...rest}
    />
  );
});
