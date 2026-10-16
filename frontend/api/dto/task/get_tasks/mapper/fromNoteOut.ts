import type { Task } from "@/entities/task.interface";

type Note = NonNullable<Task["note"]>;

const NOTE_KINDS = ["danger", "info"] as const;
type NoteKind = (typeof NOTE_KINDS)[number];

const isNoteKind = (v: unknown): v is NoteKind =>
    typeof v === "string" && (NOTE_KINDS as readonly string[]).includes(v);

/**
 * jsonb-поле note из бэка: { kind, label, text } — но схема свободная,
 * поэтому валидируем и подставляем безопасные значения.
 */
export function fromNoteOut(dto: Record<string, unknown>): Note {
    return {
        kind: isNoteKind(dto.kind) ? dto.kind : "info",
        label: typeof dto.label === "string" ? dto.label : "",
        text: typeof dto.text === "string" ? dto.text : "",
    };
}