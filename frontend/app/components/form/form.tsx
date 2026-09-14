import { ForwardedRef, forwardRef } from 'react';
import { FormProps } from './form.props';
import styles from './index.module.css';
import cn from 'classnames';

const TitledForm = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, title, ...props }, ref: ForwardedRef<HTMLFormElement>) => {
    return (
      <form className={cn(className, styles["form"])} ref={ref} {...props}>
        <div className={styles["form__title"]}>
          {title}
        </div>
        {children}
      </form>
    );
  }
);

TitledForm.displayName = 'Form';

export default TitledForm;