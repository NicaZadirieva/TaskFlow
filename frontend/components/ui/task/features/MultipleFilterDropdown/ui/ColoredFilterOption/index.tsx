'use client';

import cls from 'classnames';

import ColoredFilterOptionProps from './ColoredFilterOption.props';
import styles from './index.module.css';

export default function ColoredFilterOption({ children, className, isActive, data, dotHexColor, ...props } : ColoredFilterOptionProps) {
    return (
        <div {...props} className={cls(className, styles["pop__item"])}>
            {dotHexColor && <i className={styles["pop__dot"]} style={{"background":`${dotHexColor}`}}></i>}
            <span>{data.label}</span>
        </div>
    )
}

