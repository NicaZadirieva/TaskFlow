import { IUser } from "@/app/shared/interface/user.interface";
import { Table } from "antd";

const { Column } = Table;
export default function DesktopUserTable({
  dataSource,
  onChooseRow,
}: {
  dataSource: IUser[];
  onChooseRow: (row: IUser) => void;
}) {
  return (
    <div className="user-table-desktop">
      <Table<IUser>
        dataSource={dataSource}
        rowKey="key"
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
