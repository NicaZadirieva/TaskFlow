import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('jwt')?.value;

    const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    // Неавторизованного — на /login
    if (!token && !isPublic) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }
    // выход из системы через повторное попадание на страницу login
    if (pathname.startsWith("/login") && token) {
        const response = NextResponse.next();
        response.cookies.delete('jwt');
        return response;
    }



    // Прокидываем токен дальше в headers для server components
    const requestHeaders = new Headers(req.headers);
    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: [
        {
            source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
            missing: [
                { type: 'header', key: 'next-action' },
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};