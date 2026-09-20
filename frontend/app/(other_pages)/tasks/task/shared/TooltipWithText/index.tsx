import { Tooltip, Typography } from 'antd';
import styles from './index.module.css';
import cn from 'classnames';

const { Text } = Typography;

export default function TooltipWithText({text, className}: {text: string, className?: string}) {
	return (
		<Tooltip className={cn(className, styles.tooltip)} title={text} placement="topLeft">
            <Text className={styles.text}>{text}</Text>
        </Tooltip>
	)
}