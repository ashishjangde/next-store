import React from 'react';
import { SessionActions, Session } from '@/api-actions/session-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfilePageClientContent from './profile-client';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');


  if (!allCookies) {
    redirect('/?auth=login');
  }

  try {
    // ✅ Server-side API call with cookies forwarded
    const sessionsResponse = await SessionActions.getSessions(allCookies);
    const sessions = sessionsResponse.data?.sessions || [];

    if (!sessions || sessions.length === 0) {
      redirect('/?auth=login');
    }

    return <ProfilePageClientContent sessions={sessions}/>;
  } catch (error) {
    redirect('/?auth=login');
  }
}
