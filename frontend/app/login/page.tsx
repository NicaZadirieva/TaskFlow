"use client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styles from "./index.module.css";
import { getFormErrorMessage } from "../shared/utils/getFormErrorMessage";
import LoginFormData from "./login_form.interface";
import { useState } from "react";
import getUserReq from "./api/get_user.req";
import { showToast } from "nextjs-toast-notify";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TitledForm from '../components/form/form';

export default function LoginPage() {
  const {
    handleSubmit,
    control
  } = useForm<LoginFormData>({
    defaultValues: {
    email: "",
    password: "",
  },
  });
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    setSubmitting(true);
    return getUserReq(data.email, data.password)
      .then(() => {})
      .catch((message) => {
        showToast.error(message, {
          duration: 5000,
          progress: true,
          position: "top-right",
          transition: "bounceIn",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
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
            <TextField
              {...field}
              fullWidth
              required
              variant="outlined"
              type="email"
              label="email"
              error={!!error}
              helperText={error ? getFormErrorMessage(error) : " "}
            />
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
            <TextField
              {...field}
              required
              fullWidth
              variant="outlined"
              label="Пароль"
              type={isPasswordVisible ? "text" : "password"}
              error={!!error}
              helperText={error ? getFormErrorMessage(error) : " "}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          isPasswordVisible
                            ? "Спрятать пароль"
                            : "Отобразить пароль"
                        }
                        onClick={() => setPasswordVisible((prev) => !prev)}
                        edge="end"
                      >
                        {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Вход..." : "Войти"}
        </Button>
      </TitledForm>
    </div>
  );
}
