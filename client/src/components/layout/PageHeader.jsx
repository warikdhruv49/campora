export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-lg font-bold text-txt-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-txt-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
