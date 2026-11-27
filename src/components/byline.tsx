import Link from "next/link";
import { splitAuthors } from "@/lib/authors";

/** An author list where names with a profile link to it. */
export function Byline({
  authors,
  people,
}: {
  authors: string;
  people: { name: string; slug: string }[];
}) {
  return (
    <>
      {splitAuthors(authors, people).map((part, i) =>
        part.slug ? (
          <Link
            key={i}
            href={`/team/${part.slug}`}
            className="text-ink hover:text-accent-strong decoration-line underline underline-offset-2 transition-colors"
          >
            {part.text}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
