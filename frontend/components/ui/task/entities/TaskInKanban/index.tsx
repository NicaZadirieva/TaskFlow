'use client';

import {
	FileTextOutlined,
	PictureOutlined,
	PlusOutlined
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Card,
	message,
	Popover,
	Space,
	Tag,
	Typography
} from 'antd';
import styles from './index.module.css';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { Executor } from '@/entities/executor.interface';
import { Task } from '@/entities/task.interface';
import { User } from '@/entities/user.interface';
import TaskAssignee from '../../../assignees/entities/TaskAssignee';
import AddAssigneeForm from '../../../assignees/features/AddAssigneeForm';
import AssigneeRemoval from '../../../assignees/features/RemoveAssigneeModal';
import TimeCostsEditor from '../../../assignees/features/UpdateTimeCostModal';
import {
	DefaultTaskNote,
	DividerWithMargins,
	GithubClickableTag,
	PriorityBadge,
	StatusTag,
	TaskNote,
	TooltipWithText
} from '../../../shared';
import ShowDescription from '../ShowDescription';
import ShowImages from '../ShowImages';
import ShowMetrics from '../ShowMetrics';
import GetCurrentUserResponse from '@/api/dto/user/get_current_user/GetCurrentUserResponse';
import { useRemoveAssignee } from '@/hooks/useRemoveAssignee';
import { useAddAssignee } from '@/hooks/useAddAssignee';

const { Text } = Typography;

export default function TaskInKanban({
	task,
	users,
	currentUser
}: {
	task: Task;
	users: User[];
	currentUser: GetCurrentUserResponse;
}) {
	const [showTimeEditor, setShowTimeEditor] = useState<boolean>(false);
	const showTimeCostsEditor = () => setShowTimeEditor(true);
	const hideTimeCostsEditor = () => setShowTimeEditor(false);

	const [showDesc, setShowDesc] = useState(false);
	const showDescModal = () => setShowDesc(true);
	const hideDescModal = () => setShowDesc(false);

	const [showImages, setShowImages] = useState(false);
	const showImagesModal = () => setShowImages(true);
	const hideImagesModal = () => setShowImages(false);

	const currentAssignee = task.assignees.filter(
		(a) => a.user_id == currentUser.user_id
	)[0];
	const isDescriptionLong = !!task.description && task.description.length > 180;

	const [removing, setRemoving] = useState<Executor | null>(null);
	const [adding, setAdding] = useState(false);

	const activeCount = useMemo(
		() => task.assignees.filter((a) => !a.removed).length,
		[task.assignees]
	);
	const removedCount = task.assignees.length - activeCount;

	/* ---------- Удаление ---------- */
	const undoRemove = (assignee: Executor) => {
		message.info('Удаление отменено');
	};
	const removeAssigneeMutation = useRemoveAssignee({ taskId: task.id });
	const addAssigneeMutation = useAddAssignee({ taskId: task.id, version: task.version });
	

	const addAssignee = (a: Executor) => addAssigneeMutation.mutate(a);
	const removeAssignee = (a: Executor) => removeAssigneeMutation.mutate(a);

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
						display: 'flex',
						flexDirection: 'column',
						overflow: 'auto'
					}
				}}
				actions={[
					<Button
						key="log"
						type="link"
						data-stop-card-click
						onClick={showTimeCostsEditor}
					>
						Изменить свои часы
					</Button>
				]}
			>
				<div className={styles['priority-status__wrapper']}>
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
						<TooltipWithText text={task.title} />
						{task.project_id && (
							<Link href={`/projects/${task.project_id}`}>
								<Button type="primary">К проекту</Button>
							</Link>
						)}
					</Space>
					<DividerWithMargins />
					<Space
						orientation="horizontal"
						size={'medium'}
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
							<Badge
								count={task.task_images?.length || 0}
								size="small"
								offset={[-2, 2]}
							>
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
				<DividerWithMargins />
				{task.tags && task.tags.length > 0 && (
					<div className={styles.labels}>
						{task.tags.slice(0, 4).map((tag) => {
							return (
								<GithubClickableTag
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
											<GithubClickableTag
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
				<ShowMetrics
					actualBudget={task.executorsBudget.fact ?? task.budget.fact ?? 0}
					actualHours={task.executorsHours.fact ?? task.hours.fact ?? 0}
					estimatedBudget={
						task.executorsBudget.planned ?? task.budget.planned ?? 0
					}
					estimatedHours={
						task.executorsHours.planned ?? task.hours.planned ?? 0
					}
					due_date={new Date(task.due_date).toLocaleDateString('ru-RU')}
					overdueDays={task.overdueDays}
				/>
				{task.note && <TaskNote note={task.note} />}
				{!task.note && <DefaultTaskNote />}
				<DividerWithMargins />
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 8,
						minHeight: 24
					}}
				>
					<Text
						type="secondary"
						style={{
							fontSize: 11,
							textTransform: 'uppercase'
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
								color: '#dc2626',
								visibility: removedCount > 0 ? 'visible' : 'hidden'
							}}
						>
							−{removedCount || 0}
						</Text>
						<Button
							type="link"
							size="small"
							onClick={() => setAdding(true)}
							style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
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
						overflowY: 'auto',
						overflowX: 'hidden',
						paddingRight: 4 // чтобы контент не прилипал к скроллбару
					}}
				>
					<Space orientation="vertical" size={4} style={{ width: '100%' }}>
						{task.assignees.map((assignee) => {
							return (
								<TaskAssignee
									key={assignee.id}
									assignee={assignee}
									onChoose={(assignee) => setRemoving(assignee)}
									onUndo={(assignee) => undoRemove(assignee)}
								/>
							);
						})}
					</Space>
				</div>
			</Card>
			<TimeCostsEditor
				open={showTimeEditor}
				assignee={currentAssignee}
				taskTitle={task.title}
				onClose={() => {
					hideTimeCostsEditor();
				}}
			/>
			<ShowDescription task={task} isOpen={showDesc} onClose={hideDescModal} />
			{task.task_images && (
				<ShowImages
					isOpen={showImages}
					onClose={hideImagesModal}
					imageUrls={task.task_images}
				/>
			)}
			<AddAssigneeForm
				isOpen={adding}
				onClose={() => setAdding(false)}
				save={addAssignee}
				users={users}
			/>

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
