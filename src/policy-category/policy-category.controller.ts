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
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePolicyCategoryDto } from './dto/create-policyCategory.dto';
import { UpdatePolicyCategoryDto } from './dto/update-policyCategory.dto';
import { PolicyCategoryService } from './policy-category.service';

@Controller('policy-category')
export class PolicyCategoryController {
  constructor(private readonly policyCategoryService: PolicyCategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new policy category',
    description: 'Create a new policy category (LOB) in the CRM system',
  })
  @ApiBody({
    type: CreatePolicyCategoryDto,
    description: 'Policy category data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Policy category created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Category already exists',
  })
  async create(@Body() createPolicyCategoryDto: CreatePolicyCategoryDto) {
    return this.policyCategoryService.create(createPolicyCategoryDto);
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.policyCategoryService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.policyCategoryService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePolicyCategoryDto: UpdatePolicyCategoryDto,
  ) {
    return this.policyCategoryService.update(id, updatePolicyCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.policyCategoryService.remove(id);
  }
}
