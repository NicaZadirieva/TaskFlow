import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Сброс куки при заходе на /login до ее рендера
    if (pathname === '/login') {
        const response = NextResponse.next();
        response.cookies.delete('jwt');
        return response;
    }
    return NextResponse.next();
}
