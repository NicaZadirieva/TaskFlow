import { Button, Card, Tag, Typography } from "antd";
import { IProject } from "@/app/shared/interface/project.interface";

const { Text } = Typography;

export default function MobileProjectTable({
  dataSource,
  onEdit,
}: {
  dataSource: IProject[];
  onEdit: (item: IProject) => void;
}) {
  return (
    <div className="project-table-mobile">
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
              {item.budget_hours != null && (
                <Tag color="blue">{item.budget_hours} ч</Tag>
              )}
            </div>

            {item.description && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.description}
              </Text>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.deadline
                  ? `Дедлайн: ${new Date(item.deadline).toLocaleDateString()}`
                  : "Без дедлайна"}
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