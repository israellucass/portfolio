import { collection, config, fields, singleton } from "@keystatic/core";

const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
const [githubOwner, githubName] = githubRepo?.split("/") ?? [];
const useGitHubStorage = Boolean(githubOwner && githubName);

export default config({
  storage: useGitHubStorage
    ? {
        kind: "github",
        repo: { owner: githubOwner!, name: githubName! },
      }
    : {
        kind: "local",
      },
  singletons: {
    homepage: singleton({
      label: "Homepage",
      path: "src/content/homepage",
      format: { data: "json" },
      schema: {
        spotlightSlug: fields.relationship({
          label: "Spotlight project",
          description: "Full-width featured project at the top of the homepage",
          collection: "projects",
          validation: { isRequired: true },
        }),
        homepageOrder: fields.array(
          fields.relationship({
            label: "Project",
            collection: "projects",
            validation: { isRequired: true },
          }),
          {
            label: "Homepage order",
            description: "Drag to reorder projects on the homepage",
            itemLabel: (props) => props.value ?? "Project",
          },
        ),
        featureSideCount: fields.select({
          label: "Feature sidebar count",
          description:
            "Projects stacked beside the spotlight in the first viewport fold",
          options: [
            { label: "2 projects", value: "2" },
            { label: "3 projects", value: "3" },
          ],
          defaultValue: "2",
        }),
      },
    }),
  },
  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "src/content/project-meta/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true },
          },
          slug: {
            label: "URL slug",
            description:
              "Must match the project filename. Changing this breaks existing URLs.",
          },
        }),
        subtitle: fields.text({
          label: "Subtitle",
          description: "One sentence shown on project cards",
          multiline: true,
        }),
        year: fields.text({ label: "Year" }),
        tags: fields.text({
          label: "Tags",
          description: "Comma-separated labels shown on the card",
        }),
        cover: fields.text({
          label: "Cover image path",
          description: "Public path, e.g. /images/covers/cubo.gif",
        }),
        featured: fields.checkbox({
          label: "Featured on homepage",
          defaultValue: true,
        }),
        categories: fields.multiselect({
          label: "Categories",
          options: [
            { label: "Featured", value: "featured" },
            { label: "UX", value: "ux" },
            { label: "Motion", value: "motion" },
            { label: "Games", value: "games" },
            { label: "Graphic", value: "graphic" },
          ],
        }),
      },
    }),
  },
});
