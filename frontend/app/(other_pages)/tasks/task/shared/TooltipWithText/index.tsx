import { Tooltip, Typography } from 'antd';
import styles from './index.module.css';

const { Text } = Typography;

export default function TooltipWithText({text}: {text: string}) {
	return (
		<Tooltip title={text} placement="topLeft">
            <Text className={styles.text}>{text}</Text>
        </Tooltip>
	)
}