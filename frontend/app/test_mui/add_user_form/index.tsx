'use client';
import {
  useForm,
  Controller,
  SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';

// ---------- Схема валидации ----------
const schema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  roles: z
    .array(z.enum(['admin', 'editor', 'viewer']))
    .min(1, 'Выберите хотя бы одну роль')
    .max(2, 'Можно выбрать не более двух ролей'),
  agree: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие' }),
  }),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  { value: 'admin', label: 'Администратор' },
  { value: 'editor', label: 'Редактор' },
  { value: 'viewer', label: 'Наблюдатель' },
] as const;

// ---------- Компонент ----------
export default function AddUserForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roles: [],
      agree: false as unknown as true,
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Здесь твой запрос на сервер
    await new Promise((r) => setTimeout(r, 800));
    console.log('Отправлено:', data);
    reset();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 560, mx: 'auto', p: 3 }}
    >
      <Stack spacing={3}>
        {/* Имя */}
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Имя"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />
          )}
        />

        {/* Фамилия */}
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Фамилия"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />
          )}
        />

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        {/* Роли — группа чекбоксов */}
        <Controller
          name="roles"
          control={control}
          render={({ field }) => {
            const value = field.value ?? [];
            const toggle = (role: string, checked: boolean) => {
              field.onChange(
                checked
                  ? [...value, role]
                  : value.filter((v) => v !== role)
              );
            };
            return (
              <FormControl
                component="fieldset"
                error={!!errors.roles}
                variant="standard"
              >
                <FormLabel component="legend">Роли</FormLabel>
                <FormGroup>
                  {ROLES.map(({ value: role, label }) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Checkbox
                          checked={value.includes(role)}
                          onChange={(e) => toggle(role, e.target.checked)}
                          name={field.name}
                        />
                      }
                      label={label}
                    />
                  ))}
                </FormGroup>
                <FormHelperText>
                  {errors.roles?.message ?? 'Выберите 1–2 роли'}
                </FormHelperText>
              </FormControl>
            );
          }}
        />

        {/* Согласие */}
        <Controller
          name="agree"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.agree}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                }
                label="Я согласен с условиями"
              />
              {errors.agree && (
                <FormHelperText>{errors.agree.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Отправка…' : 'Добавить пользователя'}
        </Button>
      </Stack>
    </Box>
  );
}