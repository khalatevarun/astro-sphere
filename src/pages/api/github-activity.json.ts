import type { APIRoute } from "astro"
import { fetchGitHubActivity } from "@lib/github"

export const GET: APIRoute = async ({ url }) => {
  const username = url.searchParams.get("username") || "khalatevarun"
  const daysParam = url.searchParams.get("days")
  const days = daysParam ? Number(daysParam) || 14 : 14

  try {
    const repoActivities = await fetchGitHubActivity(username, days)

    return new Response(JSON.stringify({ repoActivities }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // cache on the edge for 1 hour
        "Cache-Control": "public, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error in /api/github-activity.json", error)
    return new Response(JSON.stringify({ repoActivities: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

