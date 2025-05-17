import React from 'react';
import { SessionActions, Session } from '@/api-actions/session-actions';
import { cookies } from 'next/headers';
import ProfilePageClientContent from './profile-client';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');


    const sessionsResponse = await SessionActions.getSessions(allCookies);
    const sessions = sessionsResponse.data?.sessions || [];


    return <ProfilePageClientContent sessions={sessions}/>;

}
