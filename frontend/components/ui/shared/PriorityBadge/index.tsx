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
  low: { color: "default", label: "low" },
  high: { color: "warning", label: "high" },
  critical: { color: "error", label: "high" },
  medium: { color: "processing", label: "medium" },
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
