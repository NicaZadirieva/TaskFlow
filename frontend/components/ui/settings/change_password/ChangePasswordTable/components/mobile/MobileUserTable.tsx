import { User } from "@/entities/user.interface";
import { Card, Tag, Typography } from "antd";
const { Text } = Typography;
export default function MobileUserTable({
  dataSource,
  selectedUser,
  selectUser,
}: {
  dataSource: User[];
  selectedUser: User | null;
  selectUser: (user: User) => void;
}) {
  return (
    <div className="user-table-mobile">
      {dataSource.map((user) => {
        const isSelected = selectedUser && user.id === selectedUser.id;
        return (
          <Card
            key={user.id}
            size="small"
            style={{
              marginBottom: 12,
              borderColor: isSelected ? "#1677ff" : undefined,
              borderWidth: isSelected ? 2 : 1,
            }}
            styles={{ body: { padding: 12 } }}
            onClick={() => selectUser(user)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  {user.name}
                </Text>
                <Tag color="blue">{user.role}</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {user.email}
              </Text>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
