type PageMastheadProps = {
  title: string;
  className?: string;
};

export function PageMasthead({ title, className = "" }: PageMastheadProps) {
  return (
    <header className={`page-masthead px-[8%] pb-6 pt-8 ${className}`.trim()}>
      <h1 className="font-display text-[28px] font-bold leading-9 text-[var(--text-primary)] md:text-[32px] md:leading-10 lg:text-[40px] lg:leading-[48px]">
        {title}
      </h1>
    </header>
  );
}
