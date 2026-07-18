export const fonts = {
  logo: "Space Grotesk",
  body: "Inter",
  display: "Space Grotesk",
  tags: "Inter",
} as const;

export const site = {
  name: "Israel Silva",
  title: "Israel Silva - Product Designer",
  tagline: "Israel Silva",
  description: "Brazilian Product Designer based in São Luís, Brazil",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://isrrr.com"),
  keywords: [
    "design",
    "ux design",
    "ui design",
    "graphic design",
    "animation",
    "pixel art",
    "illustration",
  ],
} as const;

export const navItems = [
  { label: "UX", href: "/ux" },
  { label: "Motion", href: "/motion-graphics" },
  { label: "Game design", href: "/games" },
  { label: "Graphic design", href: "/graphic" },
  { label: "About me", href: "/about", isPage: true },
] as const;

export const socialLinks = [
  {
    label: "Behance",
    href: "https://www.behance.net/israellucas",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/israellucas",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/israellucass",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/isrrr_/",
  },
  {
    label: "Flickr",
    href: "https://www.flickr.com/photos/israellucas/",
  },
] as const;

export const publications = [
  {
    title: "Educational digital game for children with autism spectrum disorder",
    href: "https://www.educacaografica.inf.br/artigos/jogo-digital-educativo-para-criancas-com-transtorno-do-espectro-autista-educational-digital-game-for-children-with-autism-spectrum-disorder",
    venue: "Revista Educação Gráfica",
  },
  {
    title:
      "Educational digital game for children with Autism Spectrum Disorder",
    href: "https://www.proceedings.blucher.com.br/article-details/jogo-digital-educativo-para-crianas-com-transtorno-do-espectro-autista-33845",
    venue: "9th Information Design International Conference",
  },
  {
    title:
      "Covid19 social design laboratory: a participatory design experiment in the pandemic",
    href: "https://www.proceedings.blucher.com.br/article-details/laboratrio-de-design-social-covid-19-um-experimento-de-design-participativo-na-pandemia-36523",
    venue: "10th Information Design International Conference",
  },
  {
    title: "Usability evaluation of E-readers: Device and Web Platform Design",
    href: "https://openaccess.blucher.com.br/article-details/10-23763",
    venue: "Chapter in ergonomia e tecnologia [em foco] – Vol. 3",
    venueHref:
      "https://openaccess.blucher.com.br/article-list/9786555502145-599/list",
  },
] as const;

export const aboutBio = [
  `I hold a bachelor's degree in Design from UFMA and a master's degree in Design from UFPE. I also studied Computer Games (Art and Animation) for a year at Glasgow Caledonian University (UK), strengthening my skills in art and animation.`,
  `Since 2014, I have gained experience across advertising agencies, the public sector, retail companies, and the electric and financial sectors. As a freelancer, I have developed projects focused mainly on digital products for e-commerce and project management, applying my design background to them.`,
] as const;

export const aboutLinks = {
  ufma: "https://sigaa.ufma.br/sigaa/public/curso/portal.jsf?lc=pt_br&id=85787",
  ufpe: "https://www.ufpe.br/ppgdesign",
  gcu: "https://www.gcu.ac.uk/aboutgcu/academicschools/cebe",
} as const;

export type Category = "featured" | "ux" | "motion" | "games" | "graphic";

export const categoryRoutes: Record<
  Exclude<Category, "featured">,
  { path: string; label: string }
> = {
  ux: { path: "/ux", label: "UX" },
  motion: { path: "/motion-graphics", label: "Motion" },
  games: { path: "/games", label: "Game design" },
  graphic: { path: "/graphic", label: "Graphic design" },
};
