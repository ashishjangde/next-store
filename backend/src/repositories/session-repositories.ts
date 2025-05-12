import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { handleDatabaseOperations } from 'src/common/utils/utils';
import { RedisService } from 'src/common/db/redis/redis.service';
import { Sessions, Users } from '@prisma/client';

@Injectable()
export class SessionRepositories {
  private readonly logger = new Logger(SessionRepositories.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheSession(session: any): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `session:id:${session.id}`, value: session },
        { key: `session:token:${session.token}`, value: session }
      ]);
    } catch (error) {
      this.logger.error(`Error caching session: ${error.message}`, error);
    }
  }

  async createSession(
    user_id: string,
    token: string,
    expires_at: Date,
    ip_address?: string,
    user_agent?: string,

  ): Promise<Sessions & {Users : Users} | null> {
    try {
      const session = await handleDatabaseOperations(() =>
        this.prisma.sessions.create({
          data: {
            user_id,
            token,
            ip_address,
            user_agent,
            expires_at,
          },
          include: { Users: true },
        }),
      );

      if (session) {
        await this.cacheSession(session);
      }
      return session;
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`, error);
      return null;
    }
  }

  async findSessionByToken(token: string): Promise<(Sessions & {Users : Users}) | null> {
    try {
      const cacheKey = `session:token:${token}`;
      const cached = await this.redis.get<Sessions & {Users : Users}>(cacheKey);
      if (cached) return cached;

      const session = await handleDatabaseOperations(() =>
        this.prisma.sessions.findUnique({
          where: { token },
          include: { Users: true },
        }),
      );

      if (session) {
        await this.redis.set(cacheKey, session);
      }
      return session;
    } catch (error) {
      this.logger.error(`Error finding session by token: ${error.message}`, error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await handleDatabaseOperations(() =>
        this.prisma.sessions.delete({
          where: { id: sessionId },
        }),
      );

      if (session) {
        await this.redis.pipelineDel([
          `session:id:${sessionId}`,
          `session:token:${session.token}`,
          `sessions:user:${session.user_id}`
        ]);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error deleting session: ${error.message}`, error);
      return false;
    }
  }

  async updateSession(token: string): Promise<Sessions & {Users : Users } | null> {
    try {
      const session = await handleDatabaseOperations(() =>
        this.prisma.sessions.update({
          where: { token },
          data: { last_activity: new Date(Date.now()) },
          include: { Users: true },
        }),
      );

      if (session) {
        await this.cacheSession(session);
      }
      return session;
    } catch (error) {
      this.logger.error(`Error updating session: ${error.message}`, error);
      return null;
    }
  }

  async deleteAllUserSessions(user_id: string): Promise<{ count: number }> {
    try {
      const sessions = await this.findAllUserSessions(user_id) || [];
      const result = await handleDatabaseOperations(() =>
        this.prisma.sessions.deleteMany({
          where: { user_id },
        }),
      );

      // Delete all related cache entries
      if (sessions.length > 0) {
        const cacheKeys = sessions.flatMap(session => [
          `session:id:${session.id}`,
          `session:token:${session.token}`
        ]);
        cacheKeys.push(`sessions:user:${user_id}`);
        await this.redis.pipelineDel(cacheKeys);
      }

      return { count: result?.count || 0 };
    } catch (error) {
      this.logger.error(`Error deleting all user sessions: ${error.message}`, error);
      return { count: 0 };
    }
  }

  async findAllUserSessions(user_id: string): Promise<Sessions[] | null> {
    try {
      const cacheKey = `sessions:user:${user_id}`;
      const cached = await this.redis.get<Sessions[]>(cacheKey);
      if (cached) return cached;

      const sessions = await handleDatabaseOperations(() =>
        this.prisma.sessions.findMany({
          where: { user_id },
          include: { Users: true },
        }),
      );

      if (sessions && sessions.length > 0) {
        await this.redis.set(cacheKey, sessions);
      }
      return sessions;
    } catch (error) {
      this.logger.error(`Error finding user sessions: ${error.message}`, error);
      return [];
    }
  }

  async findSessionById(id: string): Promise<(Sessions & { Users: Users }) | null> {
    try {
      const cacheKey = `session:id:${id}`;
      const cached = await this.redis.get<Sessions & { Users: Users }>(cacheKey);
      if (cached) return cached;

      const session = await handleDatabaseOperations(() =>
        this.prisma.sessions.findUnique({
          where: { id },
          include: { Users: true },
        }),
      );

      if (session) {
        await this.redis.set(cacheKey, session);
      }
      return session;
    } catch (error) {
      this.logger.error(`Error finding session by ID: ${error.message}`, error);
      return null;
    }
  }

  async deleteAllSessionsExceptOne(user_id: string, token: string): Promise<{ count: number }> {
    try {
      const result = await handleDatabaseOperations(() =>
        this.prisma.sessions.deleteMany({
          where: {
            user_id,
            NOT: { token },
          },
        }),
      );

      await this.redis.del(`sessions:user:${user_id}`);
      return { count: result?.count || 0 };
    } catch (error) {
      this.logger.error(`Error deleting sessions except one: ${error.message}`, error);
      return { count: 0 };
    }
  }
}
