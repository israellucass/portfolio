import { PageLayout } from "@/components/layout/PageLayout";
import { createAboutMetadata } from "@/lib/metadata";
import {
  aboutLinks,
  publications,
} from "@/data/site";

export const metadata = createAboutMetadata();

export default function AboutPage() {
  return (
    <PageLayout title="About me" showBackToTop className="page-content py-0">
      <div className="px-[8%] pb-16 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20">
          <section aria-labelledby="about-bio-heading">
            <h2 id="about-bio-heading" className="sr-only">
              Biography
            </h2>
            <div className="max-w-[40rem] space-y-7 text-[17px] leading-8 text-[var(--text-primary)] md:text-lg md:leading-9">
              <p>
                I hold a bachelor&apos;s degree in Design from{" "}
                <a
                  href={aboutLinks.ufma}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  UFMA
                </a>{" "}
                and a master&apos;s degree in Design from{" "}
                <a
                  href={aboutLinks.ufpe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  UFPE
                </a>
                . I also studied Computer Games (Art and Animation) for a year
                at{" "}
                <a
                  href={aboutLinks.gcu}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Glasgow Caledonian University (UK)
                </a>
                , strengthening my skills in art and animation.
              </p>
              <p>
                Since 2014, I have gained experience across advertising
                agencies, the public sector, retail companies, and the electric
                and financial sectors. As a freelancer, I have developed
                projects focused mainly on digital products for e-commerce and
                project management, applying my design background to them.
              </p>
            </div>
          </section>

          <section aria-labelledby="about-publications-heading">
            <h2
              id="about-publications-heading"
              className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] md:text-xs"
            >
              Published papers and book chapters
            </h2>
            <ul className="mt-6 flex flex-col gap-7 md:mt-7 md:gap-8">
              {publications.map((pub) => (
                <li key={pub.href}>
                  <a
                    href={pub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline text-[15px] font-semibold leading-6 text-[var(--text-primary)] md:text-base md:leading-6"
                  >
                    {pub.title}
                  </a>
                  <p className="mt-1.5 text-sm leading-5 text-[var(--text-muted)] md:leading-6">
                    {"venueHref" in pub && pub.venueHref ? (
                      <>
                        Chapter in{" "}
                        <a
                          href={pub.venueHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-underline"
                        >
                          {pub.venue.replace("Chapter in ", "")}
                        </a>
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
