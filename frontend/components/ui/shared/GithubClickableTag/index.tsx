import { Tag, Tooltip } from "antd";

import { GithubLabel, GithubLabelDefaultColor } from "@/entities/githubLabel.interface";
import cn from "classnames";
import styles from "./index.module.css";
import { labelColors } from "./utils/labelColor";


const githubThemeColor = labelColors(GithubLabelDefaultColor);

export default function GithubClickableTag({
  githubLabel,
  onSelect,
}: {
  githubLabel: GithubLabel;
  onSelect: (githubLabel: GithubLabel) => void;
}) {

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
