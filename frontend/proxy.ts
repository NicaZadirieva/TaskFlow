import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const COOKIE_NAME = 'jwt';

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get(COOKIE_NAME)?.value;

    const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    // Уже авторизован, но зашёл на /login → выходим из системы
    if (token && pathname === '/login') {
        const response = NextResponse.redirect(new URL('/', req.url));
        response.cookies.delete(COOKIE_NAME);
        return response;
    }

    // Неавторизованного — на /login
    if (!token && !isPublic) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
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