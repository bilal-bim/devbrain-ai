import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '../auth.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('login')
  login(@Args('email') email: string, @Args('password') password: string) {
    return this.authService.login(email, password);
  }

  @Mutation('register')
  register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name?: string,
  ) {
    return this.authService.register({ email, password, name });
  }
}