import { Injectable, Logger } from '@nestjs/common';
import { Users } from '@prisma/client';
import { handleDatabaseOperations } from 'src/common/utils/utils';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma/prisma.service';
import { RedisService } from 'src/common/db/redis/redis.service';

@Injectable()
export class UserRepositories {

  private readonly logger = new Logger(UserRepositories.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  private async cacheUser(user: Users): Promise<void> {
    try {
      await this.redis.pipeline([
        { key: `user:id:${user.id}`, value: user },
        { key: `user:email:${user.email}`, value: user },
        { key: `user:username:${user.username}`, value: user }
      ]);
    } catch (error) {
      this.logger.error(`Error caching user: ${error.message}`, error);
    }
  }

  async createUser(data: Prisma.UsersCreateInput): Promise<Users | null> {
    try {
      const user = await handleDatabaseOperations(() =>
        this.prisma.users.create({ data }),
      );

      if (user) {
        await this.cacheUser(user);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error);
      return null;
    }
  }
  async findUserByVerificationHash(vefification_hash: string):Promise<Users |null> {
   return handleDatabaseOperations(() => this.prisma.users.findUnique({
      where: {
        vefification_hash
      }
    })
    );
  }

  async findUserByUsername(username: string, checkVerified: boolean = true): Promise<Users | null> {
    const cacheKey = `user:username:${username}`;
    try {
      const cached = await this.redis.get<Users>(cacheKey);
      if (cached) {
        if (!checkVerified || cached.is_verified) {
          return cached;
        }
        return null;
      }

      const user = await handleDatabaseOperations(() =>
        this.prisma.users.findFirst({ 
          where: { 
            username,
            ...(checkVerified && { is_verified: true })
          } 
        })
      );

      if (user) {
        await this.redis.set(cacheKey, user);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by username: ${error.message}`, error);
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<Users | null> {
    const cacheKey = `user:email:${email}`;
    try {
      const cached = await this.redis.get<Users>(cacheKey);
      if (cached) return cached;

      const user = await handleDatabaseOperations(() =>
        this.prisma.users.findUnique({ where: { email } })
      );

      if (user) {
        await this.redis.set(cacheKey, user);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error);
      return null;
    }
  }

  async findUserById(id: string): Promise<Users | null> {
    const cacheKey = `user:id:${id}`;
    try {
      const cached = await this.redis.get<Users>(cacheKey);
      if (cached) return cached;

      const user = await handleDatabaseOperations(() =>
        this.prisma.users.findUnique({ where: { id } })
      );

      if (user) {
        await this.redis.set(cacheKey, user, 3600);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error.message}`, error);
      return null;
    }
  }


  async updateUser(
    id: string,
    data: Prisma.UsersUpdateInput,
  ): Promise<Users | null> {
    try {
      const user = await handleDatabaseOperations(() =>
        this.prisma.users.update({
          where: { id },
          data,
        }),
      );

      if (user) {
        // First delete old cache entries
        await this.redis.pipelineDel([
          `user:id:${id}`,
          `user:email:${user.email}`,
          `user:username:${user.username}`
        ]);

        // Then set new cache entries
        await this.cacheUser(user);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const user = await this.findUserById(id);
      if (!user) return false;

      await handleDatabaseOperations(() =>
        this.prisma.users.delete({ where: { id } }),
      );

      await this.redis.pipelineDel([
        `user:id:${id}`,
        `user:email:${user.email}`,
        `user:username:${user.username}`
      ]);

      return true;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error);
      return false;
    }
  }
}
