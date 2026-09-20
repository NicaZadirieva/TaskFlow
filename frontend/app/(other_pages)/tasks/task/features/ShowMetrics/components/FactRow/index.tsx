import styles from './index.module.css';

export const FactRow: React.FC<{
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}> = ({ label, value, valueStyle }) => (
  <div className={styles.row}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value} style={valueStyle}>
      {value}
    </span>
  </div>
);