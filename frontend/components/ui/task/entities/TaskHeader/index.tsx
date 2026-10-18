"use client";

import { Card } from "antd";
import cn from "classnames";
import { GithubClickableTag, PriorityBadge, StatusTag } from '../../../shared';
import styles from "./index.module.css";
import TaskHeaderProps from "./TaskHeader.props";


export default function TaskHeader(props: TaskHeaderProps) {
  return (
    <Card classNames={{ body: cn(styles.card, styles["task-header"]) }}>
      <div className={styles["task-header__top"]}>
        <StatusTag status={props.status} />
        <div className={styles["task-header__id"]}>id {props.id}</div>
        <PriorityBadge priority={props.priority} />
      </div>
      <div className={styles["task-header__content"]}>
        <h1 className={styles["task-header__title"]} data-title={props.title}>
          {props.title}
        </h1>
        {props.description && <p>{props.description}</p>}
      </div>
      <div className={styles["task-header__badges"]}>
        {props.tags &&
          props.tags.map((tag) => {
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
