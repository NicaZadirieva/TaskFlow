import { Button, Modal, Typography } from "antd";

import { Task } from "@/entities/task.interface";
import styles from "./index.module.css";

const { Text, Paragraph } = Typography;
export default function ShowDescription({
  task,
  isOpen,
  onClose,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      title={task.title}
      OPEN={isOpen}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Закрыть</Button>}
      width={640}
      centered
      destroyOnHidden
    >
      <Text>{"task id " + task.id}</Text>
      <Paragraph className={styles.description}>{task.description}</Paragraph>
    </Modal>
  );
}
