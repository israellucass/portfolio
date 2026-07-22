import Image from "next/image";
import { ProjectReveal } from "@/components/project/ProjectReveal";
import { RichText } from "@/components/project/RichText";
import type { ProjectFold } from "@/lib/project-fold";

type ProjectHeroFoldProps = {
  title: string;
  fold: ProjectFold;
};

export function ProjectHeroFold({ title, fold }: ProjectHeroFoldProps) {
  return (
    <section className="project-fold" id="about-the-project" aria-label="Project overview">
      <ProjectReveal>
        <header className="project-fold__header">
          <h1 className="project-fold__title">
            {title}
          </h1>
          {fold.description ? (
            <p className="project-fold__description mt-3 max-w-3xl">
              {fold.description}
            </p>
          ) : null}
        </header>
      </ProjectReveal>

      {fold.hero ? (
        <ProjectReveal delay={80}>
          <figure className="project-fold__hero mb-0 w-full">
            <Image
              src={fold.hero.src}
              alt=""
              width={1920}
              height={1080}
              className="h-auto w-full"
              sizes="(max-width: 960px) 100vw, 960px"
              priority
            />
          </figure>
        </ProjectReveal>
      ) : null}

      <div className="project-fold__details w-full">
        {fold.intro ? (
          <ProjectReveal
            className="project-fold__intro min-w-0"
            delay={120}
          >
            <RichText paragraphs={fold.intro.paragraphs} variant="fold" />
          </ProjectReveal>
        ) : null}
        <ProjectReveal
          className="project-fold__meta min-w-0"
          delay={fold.intro ? 180 : 120}
        >
          <aside aria-label="Project details">
            <RichText paragraphs={fold.details.paragraphs} variant="fold-meta" />
          </aside>
        </ProjectReveal>
      </div>
    </section>
  );
}
