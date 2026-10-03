import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, protocol } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // When the dev server listens on 0.0.0.0 (so a phone can reach it), request.url says "0.0.0.0".
  // The Host header holds the address the browser really used, so redirect there instead.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  return NextResponse.redirect(`${protocol}//${host}/checkout`);
}
