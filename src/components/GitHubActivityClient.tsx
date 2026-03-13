import { createSignal, onMount, Show, For } from "solid-js"
import type { GitHubRepoActivity } from "@lib/github"
import { formatMonthDay } from "@lib/utils"

type Props = {
  username: string
  profileUrl: string
}

export default function GitHubActivityClient({ username, profileUrl }: Props) {
  const [repos, setRepos] = createSignal<GitHubRepoActivity[] | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(true)

  onMount(async () => {
    try {
      const res = await fetch(
        `/api/github-activity.json?username=${encodeURIComponent(username)}&days=14`,
      )
      if (!res.ok) {
        throw new Error(`Request failed with ${res.status}`)
      }
      const json = await res.json()
      setRepos(json.repoActivities ?? [])
    } catch (err) {
      console.error("Error loading GitHub activity", err)
      setError("Unable to load recent GitHub activity right now.")
      setRepos([])
    } finally {
      setLoading(false)
    }
  })

  const TOP_REPOS = 3

  return (
    <section class="relative w-full max-w-4xl mx-auto px-6 mt-16 z-10">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 hover:underline"
          >
            Recent GitHub Activity
            <svg class="size-4 opacity-70" aria-hidden>
              <use href="/social.svg#github" class="fill-current" />
            </svg>
          </a>
        </h2>
        <p class="text-sm opacity-75 mt-1">
          What I've been building in the last 2 weeks.
        </p>
      </div>

      <Show when={!loading()} fallback={<p class="text-center text-sm opacity-75">Loading recent activity…</p>}>
        <Show when={!error()} fallback={<p class="text-center text-sm opacity-75">{error()}</p>}>
          <Show when={repos() && repos()!.length > 0} fallback={<p class="text-center text-sm opacity-75">No activity by {username} in the last 2 weeks on GitHub.</p>}>
            <ActivityList repos={repos()!} profileUrl={profileUrl} />
          </Show>
        </Show>
      </Show>
    </section>
  )
}

type ListProps = {
  repos: GitHubRepoActivity[]
  profileUrl: string
}

function ActivityList({ repos, profileUrl }: ListProps) {
  const TOP_REPOS = 3
  const topRepos = repos.slice(0, TOP_REPOS)
  const moreRepos = repos.slice(TOP_REPOS)

  return (
    <div class="space-y-6">
      <For each={topRepos}>
        {(repo) => <RepoBlock repo={repo} />}
      </For>

      <Show when={moreRepos.length > 0}>
        <details class="group">
          <summary class="cursor-pointer list-none text-center">
            <span class="inline-flex items-center gap-2 py-2 px-6 rounded-full border border-black/25 dark:border-white/25 hover:bg-black/5 hover:dark:bg-white/15 transition-colors duration-300 text-sm font-medium">
              See more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="stroke-current transition-transform group-open:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </summary>
          <div class="space-y-6 mt-6">
            <For each={moreRepos}>
              {(repo) => <RepoBlock repo={repo} />}
            </For>
            <div class="text-center pt-4">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 py-2 px-6 rounded-full border border-black/25 dark:border-white/25 hover:bg-black/5 hover:dark:bg-white/15 transition-colors duration-300 text-sm font-medium"
              >
                View GitHub Profile
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="stroke-current"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
        </details>
      </Show>

      <Show when={moreRepos.length === 0}>
        <div class="text-center mt-8">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 py-2 px-6 rounded-full border border-black/25 dark:border-white/25 hover:bg-black/5 hover:dark:bg-white/15 transition-colors duration-300 text-sm font-medium"
          >
            View GitHub Profile
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="stroke-current"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>
      </Show>
    </div>
  )
}

type RepoBlockProps = {
  repo: GitHubRepoActivity
}

function RepoBlock({ repo }: RepoBlockProps) {
  return (
    <div>
      <a
        href={repo.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 font-semibold text-black dark:text-white hover:underline text-sm mb-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="opacity-60 shrink-0"
        >
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        {repo.repo.split("/")[1]}
      </a>
      {repo.description && (
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
          {repo.description}
        </p>
      )}
      <ul class="space-y-1.5 border-l-2 border-black/10 dark:border-white/10 pl-4">
        <For each={repo.items}>
          {(item) => (
            <li>
              <a
                href={item.eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="group block hover:bg-black/[0.03] hover:dark:bg-white/[0.05] -ml-4 pl-4 py-1 rounded-r transition-colors"
              >
                <div class="flex items-baseline gap-2">
                  <span class="text-sm">{item.description}</span>
                  <span class="shrink-0 text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                    {(() => {
                      const d = new Date(item.date as unknown as string | number | Date)
                      return isNaN(d.getTime()) ? "" : formatMonthDay(d)
                    })()}
                  </span>
                </div>
                {item.detail && (
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                    {item.detail}
                  </p>
                )}
              </a>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

