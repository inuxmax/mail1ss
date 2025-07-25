// components/GitHubStarsWrapper.tsx
import { Suspense } from "react";

import { Skeleton } from "../ui/skeleton";
import { ErrorBoundary } from "./error-boundary";
import GitHubStarsButton from "./github-star-button";

interface GitHubResponse {
  stargazers_count: number;
}

async function getGitHubStars(owner: string, repo: string) {
  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://Mail1s.net"
    : "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/github?owner=${owner}&repo=${repo}`,
    {
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("GitHub API error:", res.status, text);
    throw new Error("Failed to fetch GitHub stars");
  }

  const data = await res.json();
  return data.stars;
}

interface Props {
  owner: string;
  repo: string;
  className?: string;
}

async function GitHubStarsWrapper(props: Props) {
  const owner = props.owner || "inuxmax";
  const repo = props.repo || "mail1s";
  const { className } = props;
  const stars = await getGitHubStars(owner, repo);

  return (
    <GitHubStarsButton
      owner={owner}
      repo={repo}
      className={className}
      initialStars={stars}
    />
  );
}

// 导出一个包装了 Suspense 的组件
export default function GitHubStarsWithSuspense(props: Props) {
  return (
    <ErrorBoundary fallback={<Skeleton className="h-4 w-12 rounded-lg" />}>
      <Suspense fallback={<Skeleton className="h-4 w-12 rounded-lg" />}>
        <GitHubStarsWrapper {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
