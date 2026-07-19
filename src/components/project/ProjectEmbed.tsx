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
        <div
          className="embed-dimensions"
          style={{ maxWidth: 375, maxHeight: 812, margin: "0 auto" }}
        >
          <div
            className="embed-aspect-ratio"
            style={{
              paddingBottom: "216.53%",
              position: "relative",
              height: 0,
            }}
          >
            <iframe
              src={src}
              title={`${title} prototype`}
              className="embed-content"
              allowFullScreen
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox={XD_EMBED_SANDBOX}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>
        <p className="project-module-embed__fallback">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
          >
            Open prototype in a new tab
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="project-module-embed">
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
      <p className="project-module-embed__fallback">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline"
        >
          Open embed in a new tab
        </a>
      </p>
    </div>
  );
}
