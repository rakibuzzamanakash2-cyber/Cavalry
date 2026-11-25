"use client";

import { useActionState, useId, useState } from "react";
import { ui } from "@/components/ui";
import { positionLabel, type Position } from "@/lib/project-rules";
import type { ActionState } from "../../actions";
import {
  addMember,
  createInvite,
  rateMember,
  requestSlots,
  setSlots,
  updateMemberRole,
} from "../../team-actions";

function Status({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <span role="status" className={`text-xs ${state.ok ? "text-muted" : "text-accent-strong"}`}>
      {state.message}
    </span>
  );
}

const POSITION_HELP: Record<Position, string> = {
  member: "Works on the project.",
  co_leader: "Helps run the team: adds members, sets roles, edits the plan.",
  leader: "Takes over the project. You stay on the team as a member.",
};

/** Member / Co-leader / Leader, for the leader and admins. Others always add members. */
function PositionField({ id, allowed }: { id: string; allowed: Position[] }) {
  const [value, setValue] = useState<Position>("member");
  if (allowed.length === 1) return <input type="hidden" name="position" value="member" />;
  return (
    <div>
      <label htmlFor={id} className={ui.label}>
        Position
      </label>
      <select
        id={id}
        name="position"
        value={value}
        onChange={(e) => setValue(e.target.value as Position)}
        aria-describedby={`${id}-help`}
        className={ui.input}
      >
        {allowed.map((p) => (
          <option key={p} value={p}>
            {positionLabel[p]}
          </option>
        ))}
      </select>
      <span id={`${id}-help`} className="text-muted mt-1 block text-xs">
        {POSITION_HELP[value]}
      </span>
    </div>
  );
}

/** Edit one person's project role (free text). */
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
  const id = `${useId()}-role`;
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
  positions,
}: {
  projectId: string;
  candidates: { id: string; name: string; email: string }[];
  positions: Position[];
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
    <form action={action} className="grid gap-4 md:grid-cols-2 md:items-start">
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
      <PositionField id={`${uid}-add-position`} allowed={positions} />
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Adding…" : "Add member"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Create a one-time invite link; the link is shown once. */
export function InviteForm({
  projectId,
  positions,
  full,
}: {
  projectId: string;
  positions: Position[];
  /** No free slot: hide the form, but keep showing a link that was just created. */
  full: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createInvite, null);
  const uid = useId();
  const [copied, setCopied] = useState(false);
  const link =
    state?.inviteLink && typeof window !== "undefined"
      ? `${window.location.origin}${state.inviteLink}`
      : state?.inviteLink;

  return (
    <div className="space-y-4">
      {full ? (
        <p className="text-muted text-sm">No free slots for invites right now.</p>
      ) : (
        <form action={action} className="grid gap-4 md:grid-cols-2 md:items-start">
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
              Note (optional, only the team runners see it)
            </label>
            <input
              id={`${uid}-invite-note`}
              name="note"
              maxLength={200}
              placeholder="e.g. For Nadia"
              className={ui.input}
            />
          </div>
          <PositionField id={`${uid}-invite-position`} allowed={positions} />
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" disabled={pending} className={ui.button}>
              {pending ? "Creating…" : "Create invite link"}
            </button>
            {state && !state.ok ? <Status state={state} /> : null}
          </div>
        </form>
      )}
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
            Works once and expires in 7 days. It holds a slot until it is used, revoked or expires.
            Send it privately.
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
  const id = `${useId()}-rating`;
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

/** The leader asks an admin for more slots. */
export function SlotRequestForm({ projectId, room }: { projectId: string; room: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestSlots, null);
  const uid = useId();
  return (
    <form action={action} className="grid gap-4 md:grid-cols-[10rem_1fr] md:items-start">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor={`${uid}-extra`} className={ui.label}>
          Extra slots
        </label>
        <select id={`${uid}-extra`} name="extra" defaultValue="1" className={ui.input}>
          {Array.from({ length: room }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-reason`} className={ui.label}>
          Why the team needs them
        </label>
        <textarea
          id={`${uid}-reason`}
          name="reason"
          rows={2}
          maxLength={500}
          required
          placeholder="e.g. We need a GIS analyst and an econometrician for the next stage."
          className={ui.input}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button type="submit" disabled={pending} className={ui.button}>
          {pending ? "Sending…" : "Ask an admin for more slots"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Admins set a project's slots directly. */
export function SetSlotsForm({
  projectId,
  slots,
  min,
  max,
}: {
  projectId: string;
  slots: number;
  min: number;
  max: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setSlots, null);
  const id = `${useId()}-slots`;
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor={id} className={ui.label}>
          Slots (admin)
        </label>
        <select id={id} name="slots" defaultValue={String(slots)} className={ui.input}>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className={ui.ghostSm}>
        {pending ? "Saving…" : "Set slots"}
      </button>
      <Status state={state} />
    </form>
  );
}
