type PageMastheadProps = {
  title: string;
  className?: string;
};

export function PageMasthead({ title, className = "" }: PageMastheadProps) {
  return (
    <header className={`page-masthead px-gutter pb-6 pt-8 ${className}`.trim()}>
      <h1 className="page-masthead__title font-display font-bold text-[var(--text-primary)]">
        {title}
      </h1>
    </header>
  );
}
