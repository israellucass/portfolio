type PageMastheadProps = {
  title: string;
  className?: string;
};

export function PageMasthead({ title, className = "" }: PageMastheadProps) {
  return (
    <header className={`page-masthead px-gutter pb-6 pt-8 ${className}`.trim()}>
      <h1 className="font-display text-[length:var(--type-2xl)] font-bold leading-[var(--leading-tight)] text-[var(--text-primary)] lg:text-[length:var(--type-3xl)]">
        {title}
      </h1>
    </header>
  );
}
