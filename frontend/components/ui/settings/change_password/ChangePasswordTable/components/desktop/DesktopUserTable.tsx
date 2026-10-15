import { User } from "@/entities/user.interface";
import { Table } from "antd";

const { Column } = Table;
export default function DesktopUserTable({
  dataSource,
  onChooseRow,
}: {
  dataSource: User[];
  onChooseRow: (row: User) => void;
}) {
  return (
    <div className="user-table-desktop">
      <Table<User>
        dataSource={dataSource}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => onChooseRow(record), // setSelectedRow(record.key)
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Имя" key="name" dataIndex="name" />
        <Column title="Email" key="email" dataIndex="email" />
        <Column title="Роль" key="role" dataIndex="role" />
      </Table>
    </div>
  );
}
