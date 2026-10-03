import ITaskNote from "@/api/types/note.types";

export function fromNoteDto(src: ITaskNote) {
    return {
        kind: src.kind as 'danger' | 'info',
        label: src.label,
        text: src.text,
    };
}