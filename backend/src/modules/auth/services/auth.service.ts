import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/services/users.service';
import { User } from '@modules/users/entities/user.entity';
import { LoggerService } from '@common/utils/logger.service';
import * as bcrypt from 'bcrypt';

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  tier: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (user && await this.validatePassword(password, user.hashedPassword)) {
        // Don't return password hash
        const { hashedPassword, ...result } = user;
        return result as User;
      }
      
      return null;
    } catch (error) {
      this.logger.error('User validation error', { email, error: error.message });
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const { email, password } = loginDto;
    
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    this.logger.logUserAction(user.id, 'user_login', { email });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResult> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    try {
      await this.usersService.findByEmail(email);
      throw new ConflictException('User with this email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // User not found, continue with registration
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await this.usersService.create({
      email,
      hashedPassword,
      name,
      // Generate a temporary auth0_id for users registering directly
      auth0Id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    const tokens = await this.generateTokens(user);

    this.logger.logUserAction(user.id, 'user_registered', { email });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      this.logger.error('Token refresh error', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a production app, you might want to blacklist the token
    // For now, just log the logout event
    this.logger.logUserAction(userId, 'user_logout');
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscriptionTier,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expirationTime'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpirationTime'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Auth0 integration methods
  async handleAuth0Login(auth0User: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }): Promise<LoginResult> {
    let user: User;

    try {
      // Try to find existing user by Auth0 ID
      user = await this.usersService.findByAuth0Id(auth0User.sub);
    } catch (error) {
      try {
        // Try to find by email
        user = await this.usersService.findByEmail(auth0User.email);
        
        // Update Auth0 ID if user exists with same email
        await this.usersService.updateAuth0Id(user.id, auth0User.sub);
      } catch (error) {
        // Create new user
        user = await this.usersService.create({
          email: auth0User.email,
          name: auth0User.name,
          avatarUrl: auth0User.picture,
          auth0Id: auth0User.sub,
        });

        this.logger.logUserAction(user.id, 'auth0_user_created', { 
          email: auth0User.email,
          auth0Id: auth0User.sub,
        });
      }
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    this.logger.logUserAction(user.id, 'auth0_login', { 
      email: user.email,
      auth0Id: auth0User.sub,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}