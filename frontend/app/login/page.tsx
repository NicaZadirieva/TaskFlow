"use client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styles from "./index.module.css";
import { getFormErrorMessage } from "../shared/utils/getFormErrorMessage";
import LoginFormData from "./login_form.interface";
import { useState } from "react";
import getUserReq from "./api/get_user.req";
import { notification } from 'antd';
import { Button, Form, Input } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import TitledForm from "../components/form/form";

export default function LoginPage() {
  const [api, contextHolder] = notification.useNotification();
  const { handleSubmit, control } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    setSubmitting(true);
    return getUserReq(data.email, data.password)
      .then(() => {})
      .catch((message) => {
        api.error({
          description: message
      });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <>
    {contextHolder}
    <div className={styles["form-container"]}>
      <TitledForm
        onSubmit={handleSubmit(onSubmit)}
        title={"Вход в систему"}
        className={styles["form"]}
      >
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email обязателен",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Введите корректный email",
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <Input
                {...field}
                type="email"
                placeholder="email"
                size="large"
              />
            </Form.Item>
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Пароль обязателен",
            minLength: { value: 6, message: "Минимум 6 символов" },
          }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item
              validateStatus={error ? "error" : ""}
              help={error ? getFormErrorMessage(error) : " "}
              required
            >
              <Input.Password
                {...field}
                placeholder="Пароль"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          )}
        />

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isSubmitting}
        >
          {isSubmitting ? "Вход..." : "Войти"}
        </Button>
      </TitledForm>
    </div>
    </>
    
  );
}