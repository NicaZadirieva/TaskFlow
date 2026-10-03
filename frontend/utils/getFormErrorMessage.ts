import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

/**
 * Функция для получения сообщения об ошибке
 * @param error объект ошибки или готовое сообщение об ошибке
 * @returns 
 */
export const getFormErrorMessage = (error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error.message === "string") return error.message;
  return "Ошибка валидации";
};