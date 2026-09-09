import { FormHTMLAttributes } from 'react';

export interface FormProps extends React.PropsWithChildren<FormHTMLAttributes<HTMLFormElement>> {
	title: string;
	submitText: string;
}