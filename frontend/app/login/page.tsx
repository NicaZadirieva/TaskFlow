"use client";
import Form from "../components/form/form";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./index.module.css";
import { getFormErrorMessage } from "../shared/utils/getFormErrorMessage";
import LoginFormData from "./login_form.interface";
import { useState } from "react";
import cn from "classnames";
import getUserReq from "./api/get_user.req";
import { showToast } from "nextjs-toast-notify";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<LoginFormData>();
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    return getUserReq(data.email, data.password)
      .then(() => {})
      .catch((message) => {
        showToast.error(
          message,
          {
            duration: 5000,
            progress: true,
            position: "top-right",
            transition: "bounceIn",
          },
        );
      });
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      title={"Вход в систему"}
      submitText={"Войти"}
      className={styles["form"]}
    >
      <div className={styles["form__row"]}>
        <label htmlFor="email">Email</label>
        <input
          className={styles["input"]}
          id="email"
          {...register("email", {
            required: "Email обязателен",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Введите корректный email",
            },
          })}
        />
        {errors.email && <p>{getFormErrorMessage(errors.email)}</p>}
      </div>

      <div className={styles["form__row"]}>
        <label htmlFor="password">Пароль</label>
        <div className={styles["password-wrapper"]}>
          <input
            className={cn(styles["input"], styles["password_input"])}
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password", {
              required: "Пароль обязателен",
              minLength: {
                value: 6,
                message: "Минимум 6 символов",
              },
            })}
          />
          <button
            className={styles["password-toggle"]}
            type="button"
            onClick={() =>
              setPasswordVisible((isPasswordVisible) => !isPasswordVisible)
            }
            aria-label={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
          >
            <img
              className={styles["eye__toggle__btn"]}
              src={isPasswordVisible ? "EyeSlash.svg" : "Eye.svg"}
              alt={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
              width={24}
              height={24}
            />
          </button>
        </div>

        {errors.password && <p>{getFormErrorMessage(errors.password)}</p>}
      </div>
    </Form>
  );
}
