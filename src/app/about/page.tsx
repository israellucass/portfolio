import { ExternalLink } from "@/components/layout/ExternalLink";
import { PageLayout } from "@/components/layout/PageLayout";
import { createAboutMetadata } from "@/lib/metadata";
import {
  aboutContact,
  aboutIntro,
  aboutLinks,
  publications,
} from "@/data/site";

export const metadata = createAboutMetadata();

export default function AboutPage() {
  return (
    <PageLayout title="About me" showBackToTop className="page-content py-0">
      <div className="px-gutter pb-16 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20">
          <section aria-labelledby="about-bio-heading">
            <h2 id="about-bio-heading" className="sr-only">
              Biography
            </h2>
            <div className="max-w-[40rem] space-y-7 text-[length:var(--type-md)] leading-[var(--leading-relaxed)] text-[var(--text-primary)] md:text-[length:var(--type-subtitle)] md:leading-[var(--leading-relaxed)]">
              <p>{aboutIntro}</p>
              <p>
                I hold a bachelor&apos;s degree in Design from{" "}
                <ExternalLink href={aboutLinks.ufma} className="link-underline">
                  UFMA
                </ExternalLink>
                . I also studied Computer Games (Art and Animation) for a year
                at{" "}
                <ExternalLink href={aboutLinks.gcu} className="link-underline">
                  Glasgow Caledonian University (UK)
                </ExternalLink>
                , strengthening my skills in art and animation.
              </p>
              <p>
                I&apos;ve worked across advertising agencies, the public sector,
                retail, and financial companies. As a freelancer, I&apos;ve
                developed digital products for e-commerce and project
                management, applying that background to interface and product
                design.
              </p>
              <p>
                <ExternalLink
                  href={aboutContact.href}
                  className="link-underline font-semibold text-[var(--text-primary)]"
                >
                  {aboutContact.label}
                </ExternalLink>
              </p>
            </div>
          </section>

          <section aria-labelledby="about-publications-heading">
            <h2
              id="about-publications-heading"
              className="font-body text-[length:var(--type-2xs)] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              Published papers and book chapters
            </h2>
            <ul className="mt-6 flex flex-col gap-7 md:mt-7 md:gap-8">
              {publications.map((pub) => (
                <li key={pub.href}>
                  <ExternalLink
                    href={pub.href}
                    className="link-underline text-[length:var(--type-md)] font-semibold leading-[var(--leading-snug)] text-[var(--text-primary)]"
                  >
                    {pub.title}
                  </ExternalLink>
                  <p className="mt-1.5 text-[length:var(--type-xs)] leading-[var(--leading-normal)] text-[var(--text-muted)]">
                    {"venueHref" in pub && pub.venueHref ? (
                      <>
                        Chapter in{" "}
                        <ExternalLink
                          href={pub.venueHref}
                          className="link-underline"
                        >
                          {pub.venue.replace("Chapter in ", "")}
                        </ExternalLink>
                      </>
                    ) : (
                      pub.venue
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
