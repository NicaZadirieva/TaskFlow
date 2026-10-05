import { Priority } from "@/entities/task.interface";
import { Badge } from "antd";


type PriorityBadgeColor =
  | "success"
  | "error"
  | "default"
  | "warning"
  | "processing";

const PRIORITY_META: Record<
  Priority,
  { color: PriorityBadgeColor; label: string }
> = {
  LOW: { color: "default", label: "low" },
  HIGH: { color: "warning", label: "high" },
  CRITICAL: { color: "error", label: "high" },
  MEDIUM: { color: "processing", label: "medium" },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge
      status={PRIORITY_META[priority].color}
      text={PRIORITY_META[priority].label}
      style={{ lineHeight: 1 }}
    />
  );
}
