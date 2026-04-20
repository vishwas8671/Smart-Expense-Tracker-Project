export function Card({ className = '', children }) {
  return (
    <div
      className={
        'rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 ' +
        className
      }
    >
      {children}
    </div>
  );
}
export function CardHeader({ children, className = '' }) {
  return <div className={'border-b border-slate-200 px-5 py-4 dark:border-slate-800 ' + className}>{children}</div>;
}
export function CardTitle({ children, className = '' }) {
  return <h3 className={'text-sm font-semibold text-slate-700 dark:text-slate-200 ' + className}>{children}</h3>;
}
export function CardBody({ children, className = '' }) {
  return <div className={'p-5 ' + className}>{children}</div>;
}
