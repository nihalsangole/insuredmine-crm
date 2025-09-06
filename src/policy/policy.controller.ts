import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { PolicyService } from './policy.service';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('search')
  @ApiQuery({
    name: 'username',
    description: 'First name of the user to search for',
    example: 'John',
    required: true,
  })
  async searchByUsername(@Query('username') username: string) {
    return this.policyService.findPolicyByUsername(username);
  }

  @Get('aggregate')
  async aggregatePoliciesByUser() {
    return this.policyService.aggregatePoliciesByUser();
  }
}
