'use client';

import { Badge, Button, Card, Space } from 'antd';
import styles from './index.module.css';
import AddTimeCostsBtn from '../../features/AddTimeCostsBtn';
import TimeCostsEditor from '../../features/TimeCostsEditor';
import { useState } from 'react';
import { assignee } from '../../../mock-data/assignee';
import { Task } from '../../../interfaces/task.interface';
import PriorityBadge from '../../features/PriorityBadge';
import StatusTag from '../../features/StatusTag';
import TooltipWithText from '../../shared/TooltipWithText';
import Link from 'next/link';
import DividerWithMargins from '../../shared/DividerWithMargins';
import ShowDescription from '../../features/ShowDescription';
import { PictureOutlined, FileTextOutlined } from "@ant-design/icons";
import ShowImages from '../../features/ShowImages';

// Пример данных изображений (в реальном проекте приходит из Task)
const taskImages: string[] = [
  "https://picsum.photos/seed/task1/800/600",
  "https://picsum.photos/seed/task2/800/600",
  "https://picsum.photos/seed/task3/800/600",
];

export default function TaskInKanban({task} : {task: Task}) {
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
	
	return (
    <>
      <Card
        hoverable
        className={styles.cardActions}
        styles={{
          body: {
            padding: 20,
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          },
        }}
        actions={[
          <AddTimeCostsBtn onClick={() => showTimeCostsEditor()}/>
        ]}
      >
		<div className={styles["priority-status__wrapper"]}>
          <div className={styles.priority__wrapper}>
            <PriorityBadge priority={task.priority}
            />
          </div>
          <StatusTag status={task.status}/>
        </div>
		<Space orientation="vertical" className={styles.content}>
          <Space
            orientation="horizontal"
            size="middle"
            className={styles.header}
          >
			<TooltipWithText text={task.title} />
			{task.project_id && (
              <Link href={"/projects/" + task.project_id}>
                <Button type="primary">К проекту</Button>
              </Link>
            )}
		  </Space>
		  <DividerWithMargins />
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
              <Badge count={taskImages.length} size="small" offset={[-2, 2]}>
                <Button
                  onClick={showImagesModal}
                  disabled={taskImages.length === 0}
                >
                  <PictureOutlined />
                  Изображения
                </Button>
              </Badge>
            </div>
		  </Space>
		</Space>
	  </Card>
	  <TimeCostsEditor
        open={showTimeEditor}
        assignee={currentUser}
        taskTitle={task.title}
        onClose={() => {
          hideTimeCostsEditor();
        }}
      />
	  <ShowDescription task={task} isOpen={showDesc} onClose={hideDescModal}/>
	  <ShowImages isOpen={showImages} onClose={hideImagesModal} imageUrls={taskImages} />
	  </>
	)
}