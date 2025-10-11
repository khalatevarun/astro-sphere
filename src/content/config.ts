import { defineCollection, z } from "astro:content"

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
    type: z.enum(["work", "education"]).default("work"),
    location: z.string().optional(),
    achievements: z.array(z.string()).optional(),
  }),
})

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
})

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    useGitHubReadme: z.boolean().default(false),
  }),
})

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
})

const opensource = defineCollection({
  type: "content",
  schema: z.object({
    projectName: z.string(),
    contributionType: z.string(),
    dateContributed: z.coerce.date(),
    repoUrl: z.string().optional(),
  }),
})

export const collections = { work, blog, projects, legal, opensource }
