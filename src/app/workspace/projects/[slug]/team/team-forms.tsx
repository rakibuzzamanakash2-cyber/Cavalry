"use client";

import { useActionState, useId, useState } from "react";
import { ui } from "@/components/ui";
import {
  addMember,
  createInvite,
  rateMember,
  updateMemberRole,
  type ActionState,
} from "../../actions";

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <span role="status" className={`text-xs ${state.ok ? "text-muted" : "text-accent-strong"}`}>
      {state.message}
    </span>
  );
}

/** Edit one team member's project role (free text). */
export function RoleEditForm({
  membershipId,
  name,
  role,
}: {
  membershipId: string;
  name: string;
  role: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateMemberRole, null);
  const id = `role-${membershipId}`;
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="membershipId" value={membershipId} />
      <label className="sr-only" htmlFor={id}>
        Project role for {name}
      </label>
      <input
        id={id}
        name="role"
        defaultValue={role}
        maxLength={60}
        required
        className={`${ui.inputSm} w-48`}
      />
      <button type="submit" disabled={pending} className={ui.buttonSm}>
        {pending ? "Saving…" : "Save role"}
      </button>
      <Status state={state} />
    </form>
  );
}

/** Add an existing member to the project. */
export function AddMemberForm({
  projectId,
  candidates,
}: {
  projectId: string;
  candidates: { id: string; name: string; email: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addMember, null);
  const uid = useId();
  if (candidates.length === 0) {
    return (
      <p className="text-muted text-sm">
        Every member is already on this project. Use an invite link to bring in someone new.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor={`${uid}-add-user`} className={ui.label}>
          Member
        </label>
        <select id={`${uid}-add-user`} name="userId" required defaultValue="" className={ui.input}>
          <option value="" disabled>
            Choose a member
          </option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-add-role`} className={ui.label}>
          Role on this project
        </label>
        <input
          id={`${uid}-add-role`}
          name="role"
          required
          maxLength={60}
          placeholder="e.g. Data engineer"
          className={ui.input}
        />
      </div>
      <button type="submit" disabled={pending} className={ui.button}>
        {pending ? "Adding…" : "Add member"}
      </button>
      <div className="sm:col-span-3">
        <Status state={state} />
      </div>
    </form>
  );
}

/** Create a one-time invite link; the link is shown once. */
export function InviteForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createInvite, null);
  const uid = useId();
  const [copied, setCopied] = useState(false);
  const link =
    state?.inviteLink && typeof window !== "undefined"
      ? `${window.location.origin}${state.inviteLink}`
      : state?.inviteLink;

  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="projectId" value={projectId} />
        <div>
          <label htmlFor={`${uid}-invite-role`} className={ui.label}>
            Role for the invitee
          </label>
          <input
            id={`${uid}-invite-role`}
            name="role"
            required
            maxLength={60}
            placeholder="e.g. Research assistant"
            className={ui.input}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-invite-note`} className={ui.label}>
            Note (optional, only you see it)
          </label>
          <input
            id={`${uid}-invite-note`}
            name="note"
            maxLength={200}
            placeholder="e.g. For Nadia"
            className={ui.input}
          />
        </div>
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Creating…" : "Create invite link"}
        </button>
      </form>
      {state && !state.ok ? <Status state={state} /> : null}
      {state?.ok && link ? (
        <div className="border-accent bg-sand/40 border-l-2 p-4">
          <p role="status" className="text-sm">
            {state.message}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor={`${uid}-invite-link`} className="sr-only">
              Invite link
            </label>
            <input
              id={`${uid}-invite-link`}
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className={`${ui.inputSm} min-w-0 flex-1 font-mono`}
            />
            <button
              type="button"
              className={ui.ghostSm}
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="text-muted mt-2 text-xs">
            Works once and expires in 7 days. Anyone with the link can join this project, so send it
            privately.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** The leader's 1–5 rating of one team member on this project. */
export function RatingForm({
  membershipId,
  name,
  rating,
}: {
  membershipId: string;
  name: string;
  rating: number | null;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(rateMember, null);
  const id = `rating-${membershipId}`;
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="membershipId" value={membershipId} />
      <label className="sr-only" htmlFor={id}>
        Rating for {name}
      </label>
      <select
        id={id}
        name="rating"
        required
        defaultValue={rating === null ? "" : String(rating)}
        className={ui.inputSm}
      >
        <option value="" disabled>
          Rate…
        </option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)} {n}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className={ui.ghostSm}>
        {pending ? "Saving…" : "Save rating"}
      </button>
      <Status state={state} />
    </form>
  );
}
