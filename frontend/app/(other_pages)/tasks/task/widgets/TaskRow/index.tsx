'use client';

import { Badge, Button, Card, message, Popover, Space, Tag, Typography } from "antd";
import AddTimeCostsBtn from "../../features/AddTimeCostsBtn";
import { useMemo, useState } from "react";
import { Assignee } from "../../../interfaces/assignee.interface";
import { Task } from "../../../interfaces/task.interface";
import styles from './index.module.css';
import { assignee } from '../../../mock-data/assignee';
import PriorityBadge from '../../shared/PriorityBadge';
import StatusTag from '../../shared/StatusTag';
import TooltipWithText from '../../shared/TooltipWithText';
import Link from 'next/link';
import GithubLabeledTag from '../../shared/GithubLabeledTag';
import { PictureOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import TaskAssignee from '../../entities/TaskAssignee';
import TimeCostsEditor from '../../features/TimeCostsEditor';
import ShowDescription from '../../features/ShowDescription';
import AssigneeAdditor from '../../features/AssigneeAdditor';
import ShowImages from '../../features/ShowImages';
import AssigneeRemoval from '../../features/AssigneeRemoval';
import cn from 'classnames';

const { Text } = Typography;
export default function TaskRow({ task }: { task: Task }) {
  const [showTimeEditor, setShowTimeEditor] = useState<boolean>(false);
  const showTimeCostsEditor = () => setShowTimeEditor(true);
  const hideTimeCostsEditor = () => setShowTimeEditor(false);

  const [showDesc, setShowDesc] = useState(false);
  const showDescModal = () => setShowDesc(true);
  const hideDescModal = () => setShowDesc(false);

  const [showImages, setShowImages] = useState(false);
  const showImagesModal = () => setShowImages(true);
  const hideImagesModal = () => setShowImages(false);

  const currentUser = assignee;
  const isDescriptionLong = !!task.description && task.description.length > 180;

  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

  const activeCount = useMemo(
    () => task.assignees.filter((a) => !a.removed).length,
    [task.assignees],
  );
  const removedCount = task.assignees.length - activeCount;

  /* ---------- Удаление ---------- */
  const undoRemove = (id: number) => {
    message.info("Удаление отменено");
  };
  const removeAssignee = (updated: Assignee) => {
    message.success("Исполнитель удалён");
  };

  /* ---------- Добавление ---------- */
  const addAssignee = (assignee: Assignee) => {
    message.success("Исполнитель добавлен");
  };

  const timeOver = task.hours.fact > task.hours.planned;
  const budgetOver = task.budget.fact > task.budget.planned;
  const isOver = timeOver || budgetOver;

  return (
    <>
      <Card
        hoverable
        className={cn(styles.cardActions)}
		classNames={{ body: styles['custom-card-body'] }}
        styles={{
          body: {
            padding: 20,
            flex: 1,
            minHeight: 0,
            
            overflow: "auto",
			gap: 15
          },
		  
        }}
        actions={[<AddTimeCostsBtn onClick={() => showTimeCostsEditor()} />]}
      >
		<div className={styles.left}>
			 <div className={styles["priority-status__wrapper"]}>
          <div className={styles.priority__wrapper}>
            <PriorityBadge priority={task.priority} />
          </div>
          <StatusTag status={task.status} />
        </div>
        <Space orientation="vertical" className={styles.content}>
          <Space
            orientation="horizontal"
            size="middle"
            className={styles.header}
          >
            <TooltipWithText text={task.title}/>
            {task.project_id && (
              <Link href={"/projects/" + task.project_id}>
                <Button type="primary">К проекту</Button>
              </Link>
            )}
          </Space>
          <Space
            orientation="horizontal"
            size={"medium"}
            className={styles.attachments}
          >
            {task.description && isDescriptionLong && (
              <Button
                type="link"
                size="small"
                data-stop-card-click
                className={styles.description__btn}
                onClick={showDescModal}
              >
                <FileTextOutlined />
                Открыть описание
              </Button>
            )}
            <div className={styles.imagesButtonWrapper}>
              <Badge count={task.task_images?.length || 0} size="small" offset={[-2, 2]}>
                <Button
                  onClick={showImagesModal}
                  disabled={!task.task_images || task.task_images?.length === 0}
                >
                  <PictureOutlined />
                  Изображения
                </Button>
              </Badge>
            </div>
          </Space>
        </Space>
        {task.tags && task.tags.length > 0 && (
          <div className={styles.labels}>
            {task.tags.slice(0, 4).map((tag) => {
              return (
                <GithubLabeledTag
                key={tag.name}
                  githubLabel={tag}
                  onSelect={() => {
                    /**TODO: сделать фильтр */
                  }}
                />
              );
            })}
            {task.tags.length >= 4 && (
              <Popover
                trigger="click"
                content={
                  <div className={styles.popoverContent}>
                    {task.tags.slice(4).map((tag) => (
                      <GithubLabeledTag
                      key={tag.name}
                        githubLabel={tag}
                        onSelect={() => {
                          /**TODO: сделать фильтр */
                        }}
                      />
                    ))}
                  </div>
                }
              >
                <Tag className={styles.moreTag}>
                  +{task.tags.slice(4).length}
                </Tag>
              </Popover>
            )}
          </div>
        )}
		</div>
		<div className={styles.right}>
			{isOver && <Tag color={"error"}>Просрочка</Tag>}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // было center
            marginBottom: 8,
            minHeight: 24,
          }}
        >
          <Text
            type="secondary"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Исполнители
          </Text>
          <Space size={6} align="center">
            <Text strong style={{ fontSize: 12 }}>
              {activeCount}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#dc2626",
                visibility: removedCount > 0 ? "visible" : "hidden",
              }}
            >
              −{removedCount || 0}
            </Text>
            <Button
              type="link"
              size="small"
              onClick={() => setAdding(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <PlusOutlined style={{ fontSize: 12, lineHeight: 1 }} />
              добавить
            </Button>
          </Space>
        </div>
        <div
          className={styles.scrollArea}
          style={{
            height: 120, // подберите под макет
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: 4, // чтобы контент не прилипал к скроллбару
          }}
        >
          <Space orientation="vertical" size={4} style={{ width: "100%" }}>
            {task.assignees.map((assignee) => {
              return <TaskAssignee assignee={assignee} onChoose={(assignee) => setRemoving(assignee)} onUndo={(assignee) => undoRemove(assignee.id)} />
            })}
          </Space>
        </div>
	
    
		</div>
	  </Card>
	  <TimeCostsEditor
			  open={showTimeEditor}
			  assignee={currentUser}
			  taskTitle={task.title}
			  onClose={() => {
				hideTimeCostsEditor();
			  }}
			/>
			<ShowDescription task={task} isOpen={showDesc} onClose={hideDescModal} />
			{task.task_images && <ShowImages
			  isOpen={showImages}
			  onClose={hideImagesModal}
			  imageUrls={task.task_images}
			/>}
			<AssigneeAdditor
			  isOpen={adding}
			  onClose={() => setAdding(false)}
			  save={addAssignee} />
	  
			{removing && (
			  <AssigneeRemoval
				assignee={removing}
				onClose={() => setRemoving(null)}
				isOpen={!!removing}
				onRemove={removeAssignee}
			  />
			)}
    </>
  );
}
