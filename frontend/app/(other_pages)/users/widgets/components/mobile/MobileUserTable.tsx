import { Button, Card, Tag, Typography } from "antd";
import { IUser, TenantRole } from "@/app/shared/interface/user.interface";
import { renderActive } from "../../../helpers/renderActive";


const { Text } = Typography;

export default function MobileUserTable({
  dataSource,
  onEdit,
}: {
  dataSource: IUser[];
  onEdit: (item: IUser) => void;
}) {
  return (
    <div className="user-table-mobile">
      {dataSource.map((item) => (
        <Card
          key={item.id}
          size="small"
          style={{ marginBottom: 12 }}
          styles={{ body: { padding: 12 } }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                {item.name}
              </Text>
              {renderActive(item)}
            </div>

            <Text type="secondary" style={{ fontSize: 13 }}>
              {item.email}
            </Text>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Tag color="blue">{item.role}</Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.role === TenantRole.CLIENT
                  ? "Клиент не имеет"
                  : `${item.hourly_rate ?? "—"} ₽/ч`}
              </Text>
            </div>

            <Button
              type="link"
              style={{ padding: 0, alignSelf: "flex-start", marginTop: 4 }}
              onClick={() => onEdit(item)}
            >
              Редактировать
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
