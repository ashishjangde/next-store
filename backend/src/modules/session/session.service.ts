import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionRepositories } from 'src/repositories/session-repositories';
import { SessionDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepositories: SessionRepositories) {}

  /**
   * Get all sessions for a user with current session marked
   */
  async getAllSessions(
    userId: string,
    currentSessionToken: string,
  ): Promise<SessionDto[]> {
    const sessions = await this.sessionRepositories.findAllUserSessions(userId);

    if (!sessions || sessions.length === 0) {
      return [];
    }

    // Map to DTO and mark the current session
    return sessions.map(session => ({
      id: session.id,
      user_id: session.user_id,
      created_at: session.created_at,
      expired_at: session.expires_at,
      ip_address: session.ip_address ?? undefined,
      user_agent: session.user_agent ?? undefined,
      is_current: session.token === currentSessionToken,
    }));
  }


  async deleteAllSessionsExceptCurrent(
    userId: string,
    currentSessionToken: string,
  ): Promise<{ count: number }> {
    // First verify that the current session belongs to the user
    const currentSession =
      await this.sessionRepositories.findSessionByToken(currentSessionToken);

    if (!currentSession) {
      throw new UnauthorizedException('Current session not found');
    }

    if (currentSession.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete these sessions');
    }

    // Delete all sessions except the current one
    const result = await this.sessionRepositories.deleteAllSessionsExceptOne(
      userId,
      currentSessionToken,
    );

    return { count: result?.count || 0 };
  }


  async deleteSession(
    userId: string,
    sessionId: string,
    currentSessionToken: string,
  ): Promise<void> {
    // Get the session to delete
    const sessionToDelete =
      await this.sessionRepositories.findSessionById(sessionId);

    if (!sessionToDelete) {
      throw new NotFoundException('Session not found');
    }

    // Check if the session belongs to the user
    if (sessionToDelete.user_id !== userId) {
      throw new ForbiddenException('Not authorized to delete this session');
    }

    // Check if it's the current session
    const currentSession =
      await this.sessionRepositories.findSessionByToken(currentSessionToken);

    if (sessionToDelete.id === currentSession?.id) {
      throw new ForbiddenException(
        'Cannot delete your current session. Use logout instead.',
      );
    }

    // Delete the session
    await this.sessionRepositories.deleteSession(sessionId);
  }
}