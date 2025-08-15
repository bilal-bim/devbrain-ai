import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SubscriptionTier, SubscriptionStatus } from '../entities/user.entity';
import { LoggerService } from '@common/utils/logger.service';
import { CacheService } from '@common/utils/cache.service';

export interface CreateUserDto {
  email: string;
  name?: string;
  avatarUrl?: string;
  auth0Id: string;
  hashedPassword?: string;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    try {
      await this.findByEmail(createUserDto.email);
      throw new ConflictException('User with this email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // User not found, continue with creation
    }

    const user = this.usersRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      avatarUrl: createUserDto.avatarUrl,
      auth0Id: createUserDto.auth0Id,
      subscriptionTier: SubscriptionTier.FREE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      onboardingCompleted: false,
      preferences: {},
    });

    const savedUser = await this.usersRepository.save(user);

    // Initialize user quotas based on subscription tier
    await this.initializeUserQuotas(savedUser.id, savedUser.subscriptionTier);

    this.logger.log(`User created: ${savedUser.email}`);
    
    return savedUser;
  }

  async findById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.cacheService.get<User>(cacheKey);
    
    if (!user) {
      user = await this.usersRepository.findOne({
        where: { id },
        relations: ['projects', 'teamMemberships'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.cacheService.set(cacheKey, user, 300); // 5 minutes cache
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['projects', 'teamMemberships'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findByAuth0Id(auth0Id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { auth0Id },
      relations: ['projects', 'teamMemberships'],
    });

    if (!user) {
      throw new NotFoundException(`User with Auth0 ID ${auth0Id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();

    const updatedUser = await this.usersRepository.save(user);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    this.logger.logUserAction(id, 'user_updated', updateUserDto);

    return updatedUser;
  }

  async updateAuth0Id(id: string, auth0Id: string): Promise<User> {
    const user = await this.findById(id);
    user.auth0Id = auth0Id;
    user.updatedAt = new Date();

    const updatedUser = await this.usersRepository.save(user);
    await this.cacheService.del(`user:${id}`);

    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  async completeOnboarding(id: string): Promise<User> {
    const user = await this.findById(id);
    user.onboardingCompleted = true;
    user.updatedAt = new Date();

    const updatedUser = await this.usersRepository.save(user);
    await this.cacheService.del(`user:${id}`);

    this.logger.logUserAction(id, 'onboarding_completed');

    return updatedUser;
  }

  async updateSubscription(
    id: string,
    tier: SubscriptionTier,
    status: SubscriptionStatus,
    stripeCustomerId?: string,
  ): Promise<User> {
    const user = await this.findById(id);
    
    const oldTier = user.subscriptionTier;
    
    user.subscriptionTier = tier;
    user.subscriptionStatus = status;
    if (stripeCustomerId) {
      user.stripeCustomerId = stripeCustomerId;
    }
    user.updatedAt = new Date();

    const updatedUser = await this.usersRepository.save(user);
    
    // Update user quotas if tier changed
    if (oldTier !== tier) {
      await this.updateUserQuotas(id, tier);
    }

    await this.cacheService.del(`user:${id}`);

    this.logger.logUserAction(id, 'subscription_updated', {
      oldTier,
      newTier: tier,
      status,
    });

    return updatedUser;
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<User> {
    const user = await this.findById(id);
    
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
    user.updatedAt = new Date();

    const updatedUser = await this.usersRepository.save(user);
    await this.cacheService.del(`user:${id}`);

    this.logger.logUserAction(id, 'preferences_updated', preferences);

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    
    await this.usersRepository.remove(user);
    await this.cacheService.del(`user:${id}`);

    this.logger.logUserAction(id, 'user_deleted');
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    freeUsers: number;
    paidUsers: number;
    newUsersThisMonth: number;
  }> {
    const cacheKey = 'user_stats';
    let stats = await this.cacheService.get(cacheKey);
    
    if (!stats) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [totalUsers, activeUsers, freeUsers, paidUsers, newUsersThisMonth] = await Promise.all([
        this.usersRepository.count(),
        this.usersRepository.count({
          where: { 
            lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          },
        }),
        this.usersRepository.count({
          where: { subscriptionTier: SubscriptionTier.FREE },
        }),
        this.usersRepository.count({
          where: [
            { subscriptionTier: SubscriptionTier.STARTER },
            { subscriptionTier: SubscriptionTier.PRO },
            { subscriptionTier: SubscriptionTier.ENTERPRISE },
          ],
        }),
        this.usersRepository.count({
          where: { 
            createdAt: new Date(startOfMonth.getTime()) // This month
          },
        }),
      ]);

      stats = {
        totalUsers,
        activeUsers,
        freeUsers,
        paidUsers,
        newUsersThisMonth,
      };

      await this.cacheService.set(cacheKey, stats, 300); // 5 minutes cache
    }

    return stats;
  }

  private async initializeUserQuotas(userId: string, tier: SubscriptionTier): Promise<void> {
    // This would typically create entries in a usage_quotas table
    // For now, we'll just log the initialization
    this.logger.log(`Initializing quotas for user ${userId} with tier ${tier}`);
  }

  private async updateUserQuotas(userId: string, tier: SubscriptionTier): Promise<void> {
    // This would typically update entries in a usage_quotas table
    // For now, we'll just log the update
    this.logger.log(`Updating quotas for user ${userId} to tier ${tier}`);
  }
}