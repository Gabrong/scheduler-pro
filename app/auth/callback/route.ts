import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL('/', request.url));
}
