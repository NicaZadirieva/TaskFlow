"use client";

import { Task } from "@/entities/task.interface";
import { Card } from "antd";
import cn from "classnames";
import { GithubClickableTag, PriorityBadge, StatusTag } from '../../../shared';
import styles from "./index.module.css";


export default function TaskHeader({ task }: { task: Task }) {
  return (
    <Card classNames={{ body: cn(styles.card, styles["task-header"]) }}>
      <div className={styles["task-header__top"]}>
        <StatusTag status={task.status} />
        <div className={styles["task-header__id"]}>id {task.id}</div>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className={styles["task-header__content"]}>
        <h1 className={styles["task-header__title"]} data-title={task.title}>
          {task.title}
        </h1>
        {task.description && <p>{task.description}</p>}
      </div>
      <div className={styles["task-header__badges"]}>
        {task.tags &&
          task.tags.map((tag) => {
            return (
              <GithubClickableTag
                githubLabel={tag}
                key={tag.name}
                onSelect={() => {
                  /**TODO: добавить фильтр */
                }}
              ></GithubClickableTag>
            );
          })}
      </div>
    </Card>
  );
}
