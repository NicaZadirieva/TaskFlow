import { ForwardedRef, forwardRef } from 'react';
import { FormProps } from './form.props';
import styles from './index.module.css';
import cn from 'classnames';

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, title, submitText, ...props }, ref: ForwardedRef<HTMLFormElement>) => {
    return (
      <form className={cn(className, styles["form"])} ref={ref} {...props}>
        <div className={styles["form__title"]}>
          {title}
        </div>
        {children}
        <button className={styles["form__button-submit"]}>
          {submitText}
        </button>
      </form>
    );
  }
);

Form.displayName = 'Form';

export default Form;