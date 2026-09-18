export const FactRow: React.FC<{
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}> = ({ label, value, valueStyle }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid #e5e7eb',
    }}
  >
    <span
      style={{
        color: '#6b7280',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontWeight: 600,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        ...valueStyle,
      }}
    >
      {value}
    </span>
  </div>
);

