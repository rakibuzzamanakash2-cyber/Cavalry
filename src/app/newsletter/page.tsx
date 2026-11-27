import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Get an email when CAVALRY research publishes new papers, datasets and news.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Newsletter" title="Research updates by email">
        We&apos;ll write when we publish something: a paper, a dataset or news worth reading. Not
        often, and never to sell anything.
      </PageHeader>
      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <NewsletterForm />
        </div>
        <div className="text-muted space-y-3 text-sm leading-relaxed lg:col-span-5 lg:col-start-8">
          <p>
            We keep only your email address and when you signed up. It is used for these updates and
            nothing else, and never shared.
          </p>
          <p>Every email has an unsubscribe link. Unsubscribing deletes your address.</p>
        </div>
      </div>
    </div>
  );
}
