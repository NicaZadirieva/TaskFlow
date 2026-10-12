'use server';

import { logInReq } from '@/api/requests';
import RequestError from '@/api/utils/error';
import { cookies } from 'next/headers';

export async function loginAction(email: string, password: string) {
    try {
        const jwt = await logInReq(email, password);

        (await cookies()).set({
            name: 'jwt',
            value: jwt,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60,
        });

        return { success: true };
    } catch (e) {
        console.error(e);
        if (e instanceof RequestError) {
            return { error: e.message, status: e.statusCode };
        }
        return { error: "Произошла ошибка. Обратитесь к администратору", status: 401 };
    }
}
