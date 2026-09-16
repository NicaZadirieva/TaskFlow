"use client";

import { Button, Table } from "antd";
import { IProject } from "@/app/shared/interface/project.interface";

const { Column } = Table;

export default function DesktopProjectTable({
  onEdit,
  dataSource,
}: {
  onEdit: (record: IProject) => void;
  dataSource: IProject[];
}) {
  return (
    <div className="project-table-desktop">
      <Table<IProject> dataSource={dataSource} rowKey="id">
        <Column title="Название" key="name" dataIndex="name" />
        <Column
          title="Описание"
          key="description"
          render={(_, record: IProject) => record.description ?? "—"}
        />
        <Column
          title="Бюджет (часы)"
          key="budgetHours"
          render={(_, record: IProject) => record.budget_hours ?? "—"}
        />
        <Column
          title="Дедлайн"
          key="deadline"
          render={(_, record: IProject) =>
            record.deadline
              ? new Date(record.deadline).toLocaleDateString()
              : "—"
          }
        />
        <Column
          title="Редактировать"
          key="edit"
          render={(_, record: IProject) => (
            <Button type="link" onClick={() => onEdit(record)}>
              Изменить
            </Button>
          )}
        />
      </Table>
    </div>
  );
}