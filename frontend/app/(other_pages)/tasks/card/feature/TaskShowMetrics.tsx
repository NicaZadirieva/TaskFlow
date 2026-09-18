'use client';
import { Progress, Typography } from 'antd';
import { FactRow } from '../entities/FactRow';

const { Text } = Typography;

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function TaskShowMetrics({actualHours, estimatedHours, actualBudget, estimatedBudget, due_date, overdueDays}: {actualHours: number, estimatedHours: number, actualBudget: number, estimatedBudget: number, due_date: string, overdueDays: number}) {
  const timePercent = Math.min(
    100,
    Math.round((actualHours / estimatedHours) * 100),
  );
  const budgetPercent = Math.min(
    100,
    Math.round((actualBudget / estimatedBudget) * 100),
  );
  return <>
  <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            <Text type="secondary">Время</Text>
            <span>
              <Text strong>{actualHours}</Text>{" "}
              <Text type="secondary" style={{ fontSize: 11 }}>
                / {estimatedHours} ч
              </Text>
            </span>
          </div>
          <Progress
            percent={timePercent}
            showInfo={false}
            strokeColor={actualHours > estimatedHours ? "#dc2626" : "#16a34a"}
            railColor="#eef0f3"
            size={["100%", 8]}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            <Text type="secondary">Бюджет</Text>
            <span>
              <Text strong>{fmt(actualBudget)}</Text>{" "}
              <Text type="secondary" style={{ fontSize: 11 }}>
                / {fmt(estimatedBudget)} ₽
              </Text>
            </span>
          </div>
          <Progress
            percent={budgetPercent}
            showInfo={false}
            strokeColor={actualBudget > estimatedBudget ? "#dc2626" : "#16a34a"}
            railColor="#eef0f3"
            size={["100%", 8]}
          />
        </div>
      </div>

      <div>
        <FactRow label="Дедлайн" value={due_date} />
        <FactRow
          label="Просрочка"
          value={overdueDays > 0 ? `+${overdueDays} дней` : "нет"}
          valueStyle={
            overdueDays > 0 ? { color: "#dc2626" } : { color: "#16a34a" }
          }
        />
      </div>

  </>;
}
