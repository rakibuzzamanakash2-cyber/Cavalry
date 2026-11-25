/** Result of an admin content form (news, publications). */
export type ContentState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
} | null;

export function formValues(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return errors;
}
