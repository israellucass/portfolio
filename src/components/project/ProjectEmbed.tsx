const ALLOWED_EMBED_HOSTS = ["xd.adobe.com", "player.vimeo.com"];

const XD_EMBED_SANDBOX =
  "allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-presentation";

type ProjectEmbedProps = {
  src: string;
  localSrc?: string;
  title: string;
};

function isAllowedEmbedUrl(url: string): boolean {
  try {
    return ALLOWED_EMBED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isAdobeXdEmbed(url: string): boolean {
  try {
    return new URL(url).hostname === "xd.adobe.com";
  } catch {
    return false;
  }
}

function ExternalLinkIcon() {
  return (
    <svg
      className="project-module-embed__external-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

function EmbedFallbackLink({ href }: { href: string }) {
  return (
    <p className="project-module-embed__fallback">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="project-module-embed__fallback-link link-underline"
      >
        Or open in a new tab
        <ExternalLinkIcon />
      </a>
    </p>
  );
}

export function ProjectEmbed({ src, localSrc, title }: ProjectEmbedProps) {
  if (localSrc) {
    return (
      <div className="project-module-embed">
        <div className="project-module-embed__frame project-module-embed__frame--video">
          <video
            src={localSrc}
            controls
            playsInline
            className="project-module-embed__media"
            title={`${title} video`}
          />
        </div>
      </div>
    );
  }

  if (!isAllowedEmbedUrl(src)) {
    return null;
  }

  const isXd = isAdobeXdEmbed(src);

  if (isXd) {
    return (
      <div className="project-module-embed">
        <div className="project-module-embed__prototype">
          <div className="project-module-embed__frame project-module-embed__frame--xd">
            <iframe
              src={src}
              title={`${title} prototype`}
              className="project-module-embed__media embed-content"
              allowFullScreen
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox={XD_EMBED_SANDBOX}
            />
          </div>
          <EmbedFallbackLink href={src} />
        </div>
      </div>
    );
  }

  return (
    <div className="project-module-embed">
      <div className="project-module-embed__prototype">
        <div className="project-module-embed__frame project-module-embed__frame--video">
          <iframe
            src={src}
            title={`${title} embed`}
            className="project-module-embed__media embed-content"
            allowFullScreen
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
        <EmbedFallbackLink href={src} />
      </div>
    </div>
  );
}
