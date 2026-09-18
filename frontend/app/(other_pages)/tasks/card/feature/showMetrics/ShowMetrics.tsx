'use client';

import { Progress, Typography } from 'antd';
import { FactRow } from '../../entities/factRow/FactRow';
import styles from './ShowMetrics.module.css';

const { Text } = Typography;

const fmt = (n: number) => n.toLocaleString('ru-RU');

interface Props {
  actualHours: number;
  estimatedHours: number;
  actualBudget: number;
  estimatedBudget: number;
  due_date: string;
  overdueDays: number;
}

export default function ShowMetrics({
  actualHours,
  estimatedHours,
  actualBudget,
  estimatedBudget,
  due_date,
  overdueDays,
}: Props) {
  const timePercent = Math.min(
    100,
    Math.round((actualHours / estimatedHours) * 100),
  );
  const budgetPercent = Math.min(
    100,
    Math.round((actualBudget / estimatedBudget) * 100),
  );

  const timeOver = actualHours > estimatedHours;
  const budgetOver = actualBudget > estimatedBudget;

  return (
    <>
      <div className={styles.metrics}>
        {/* Время */}
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <Text type="secondary">Время</Text>
            <span className={styles.metricValue}>
              <Text strong>{actualHours}</Text>{' '}
              <Text type="secondary" className={styles.metricValueSecondary}>
                / {estimatedHours} ч
              </Text>
            </span>
          </div>
          <Progress
            percent={timePercent}
            showInfo={false}
            strokeColor={timeOver ? '#dc2626' : '#16a34a'}
            railColor="#eef0f3"
            size={['100%', 8]}
          />
        </div>

        {/* Бюджет */}
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <Text type="secondary">Бюджет</Text>
            <span className={styles.metricValue}>
              <Text strong>{fmt(actualBudget)}</Text>{' '}
              <Text type="secondary" className={styles.metricValueSecondary}>
                / {fmt(estimatedBudget)} ₽
              </Text>
            </span>
          </div>
          <Progress
            percent={budgetPercent}
            showInfo={false}
            strokeColor={budgetOver ? '#dc2626' : '#16a34a'}
            railColor="#eef0f3"
            size={['100%', 8]}
          />
        </div>
      </div>

      {/* Факты */}
      <div className={styles.facts}>
        <FactRow label="Дедлайн" value={due_date} />
        <FactRow
          label="Просрочка"
          value={overdueDays > 0 ? `+${overdueDays} дней` : 'нет'}
          valueStyle={
            overdueDays > 0 ? { color: '#dc2626' } : { color: '#16a34a' }
          }
        />
      </div>
    </>
  );
}