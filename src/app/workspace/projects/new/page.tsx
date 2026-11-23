import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { NewProjectForm } from "./new-project-form";

export const metadata: Metadata = { title: "Open a project" };

// The workspace layout already checks membership; createProject checks again.
export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · new project" title="Open a project">
        You become the team leader. You can add members, give them roles and invite new people once
        the project is open.
      </PageHeader>
      <div className="pt-8">
        <NewProjectForm />
        <p className="mt-8">
          <Link href="/workspace" className={ui.link}>
            ← Back to the workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
