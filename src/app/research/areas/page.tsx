import { redirect } from "next/navigation";

// The list of areas lives on the research page.
export default function ResearchAreasIndex() {
  redirect("/research#areas");
}
