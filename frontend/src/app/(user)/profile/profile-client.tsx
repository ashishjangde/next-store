
import { Session } from '@/api-actions/session-actions';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProfilePageClientProps {
  sessions: Session[];
}
 
export default function ProfilePageClientContent({ sessions }: ProfilePageClientProps) {
  return (
   <div>
    hello
   </div>
  );
}

