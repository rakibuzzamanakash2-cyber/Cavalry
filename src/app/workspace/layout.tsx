import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { requireMember } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s · Workspace · CAVALRY research" },
  robots: { index: false, follow: false },
};

// Every workspace page depends on who is signed in, so it can't be part of a
// prerendered shell. Opt out of instant-navigation validation for navigations
// into /workspace (the documented approach for authenticated routes).
export const instant = false;

// Everything under /workspace is for members. The gate runs before any page
// content renders, and each data getter also checks membership on its own.
export default function WorkspaceLayout({ children }: LayoutProps<"/workspace">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <MemberGate>{children}</MemberGate>
    </Suspense>
  );
}

async function MemberGate({ children }: { children: React.ReactNode }) {
  await requireMember();
  return <>{children}</>;
}
