export function Input({ className = '', ...props }) {
  return (
    <input
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' +
        className
      }
      {...props}
    />
  );
}
export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' +
        className
      }
      {...props}
    >
      {children}
    </select>
  );
}
export function Label({ children, className = '' }) {
  return (
    <label className={'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400 ' + className}>
      {children}
    </label>
  );
}
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' +
        className
      }
      {...props}
    />
  );
}
