import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Varun Khalate",
  DESCRIPTION: "Welcome to Varun Khalate's digital garden.",
  AUTHOR: "Varun Khalate",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
  // { 
  //   TEXT: "Work", 
  //   HREF: "/work", 
  // },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "khalatevarun@gmail.com",
    HREF: "mailto:khalatevarun@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "khalatevarun",
    HREF: "https://github.com/khalatevarun/"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "varun-khalate",
    HREF: "https://www.linkedin.com/in/varun-khalate/",
  },
  { 
    NAME: "X",
    ICON: "twitter-x",
    TEXT: "varunhnk",
    HREF: "https://twitter.com/markhorn_dev",
  },
]

