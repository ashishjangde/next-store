
import { Session } from '@/api-actions/session-actions';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProfilePageClientProps {
  sessions: Session[];
}
 
export default function ProfilePageClientContent({ sessions }: ProfilePageClientProps) {
  return (
    <div className="container py-8">
          <h1 className="text-2xl font-bold mb-6">Active Sessions</h1>
          <div className="grid gap-4">
            {sessions.map((session: Session) => (
              <Card key={session.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{session.user_agent}</p>
                    <p className="text-sm text-gray-500">IP: {session.ip_address}</p>
                    <p className="text-sm text-gray-500">
                      Created: {format(new Date(session.created_at), 'PPpp')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires: {format(new Date(session.expired_at), 'PPpp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.is_current && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
  );
}

