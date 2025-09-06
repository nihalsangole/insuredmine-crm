import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreatePolicyCarrierDto } from './dto/create-policyCarrier.dto';
import { UpdatePolicyCarrierDto } from './dto/update-policyCarrier.dto';
import { PolicyCarrierService } from './policy-carrier.service';

@Controller('policy-carrier')
export class PolicyCarrierController {
  constructor(private readonly policyCarrierService: PolicyCarrierService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new policy carrier',
    description:
      'Create a new policy carrier (insurance company) in the CRM system',
  })
  @ApiBody({
    type: CreatePolicyCarrierDto,
    description: 'Policy carrier data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Policy carrier created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Carrier already exists',
  })
  async create(@Body() createPolicyCarrierDto: CreatePolicyCarrierDto) {
    return this.policyCarrierService.create(createPolicyCarrierDto);
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.policyCarrierService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.policyCarrierService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePolicyCarrierDto: UpdatePolicyCarrierDto,
  ) {
    return this.policyCarrierService.update(id, updatePolicyCarrierDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.policyCarrierService.remove(id);
  }
}
