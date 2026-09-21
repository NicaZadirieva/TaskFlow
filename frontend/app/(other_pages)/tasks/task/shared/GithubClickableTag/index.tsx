import { Tag, Tooltip } from "antd";
import { GithubLabel } from "../../../interfaces/githubLabel.interface";
import { labelColors } from "./utils/labelColor";
import cn from "classnames";
import styles from "./index.module.css";

export default function GithubClickableTag({
  githubLabel,
  onSelect,
}: {
  githubLabel: GithubLabel;
  onSelect: (githubLabel: GithubLabel) => void;
}) {
  const githubThemeColor = labelColors(githubLabel.color);
  return (
    <Tooltip
      key={githubLabel.id ?? githubLabel.name}
      title={githubLabel.description || undefined}
    >
      <Tag
        onClick={(e) => {
          e.stopPropagation();
          onSelect(githubLabel);
        }}
        className={cn(styles.tag, styles.tagClickable)}
        style={{
          background: githubThemeColor.bg,
          borderColor: githubThemeColor.border,
          color: githubThemeColor.text,
        }}
      >
        {githubLabel.name}
      </Tag>
    </Tooltip>
  );
}
