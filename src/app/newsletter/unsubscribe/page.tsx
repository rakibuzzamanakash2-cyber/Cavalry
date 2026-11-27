import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Newsletter" title="Unsubscribe">
        Stop receiving CAVALRY research updates. Your email address will be deleted.
      </PageHeader>
      <div className="py-10">
        <Suspense fallback={null}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Form({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const token = (await searchParams).token;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-muted">
        This page needs the link from one of our emails. Use the unsubscribe link at the bottom of
        any update we sent you.
      </p>
    );
  }
  return <UnsubscribeForm token={token} />;
}
