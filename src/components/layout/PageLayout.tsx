import { BackToTop } from "@/components/layout/BackToTop";
import { PageMasthead } from "@/components/layout/PageMasthead";

type PageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  showBackToTop?: boolean;
  className?: string;
  as?: "article" | "section";
};

export function PageLayout({
  children,
  title,
  showBackToTop = false,
  className = "",
  as: Tag = "section",
}: PageLayoutProps) {
  return (
    <Tag className={`site-content w-full ${className}`.trim()}>
      {title ? <PageMasthead title={title} /> : null}
      {children}
      {showBackToTop ? <BackToTop /> : null}
    </Tag>
  );
}
