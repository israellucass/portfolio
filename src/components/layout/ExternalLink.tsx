import type { ComponentProps } from "react";
import { ExternalLinkIcon } from "@/components/layout/ExternalLinkIcon";

type ExternalLinkProps = ComponentProps<"a">;

export function ExternalLink({
  className = "",
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`link-external ${className}`.trim()}
      {...props}
    >
      {children}
      <ExternalLinkIcon />
    </a>
  );
}
