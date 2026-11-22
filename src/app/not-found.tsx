import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
      <p className="tracking-caps text-accent-strong text-sm uppercase">404</p>
      <h1 className="mt-4 text-4xl">Page not found</h1>
      <p className="text-muted mt-4">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="text-accent-strong mt-8 inline-block underline">
        Back to home
      </Link>
    </section>
  );
}
