import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePolicyCategoryDto } from './dto/create-policyCategory.dto';
import { UpdatePolicyCategoryDto } from './dto/update-policyCategory.dto';
import { PolicyCategory } from './policy-category.schema';

@Injectable()
export class PolicyCategoryService {
  constructor(
    @InjectModel(PolicyCategory.name)
    private policyCategoryModel: Model<PolicyCategory>,
  ) {}

  async create(
    createPolicyCategoryDto: CreatePolicyCategoryDto,
  ): Promise<PolicyCategory> {
    const existingCategory = await this.policyCategoryModel.findOne({
      categoryName: createPolicyCategoryDto.categoryName,
    });

    if (existingCategory) {
      throw new ConflictException(
        'Policy category with this name already exists',
      );
    }

    const createdCategory = new this.policyCategoryModel(
      createPolicyCategoryDto,
    );
    return createdCategory.save();
  }

  async findAll(search?: string): Promise<PolicyCategory[]> {
    const query: any = {};

    if (search) {
      query.categoryName = { $regex: search, $options: 'i' };
    }

    return this.policyCategoryModel.find(query).exec();
  }

  async findOne(id: string): Promise<PolicyCategory> {
    const category = await this.policyCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Policy category not found');
    }
    return category;
  }

  async update(
    id: string,
    updatePolicyCategoryDto: UpdatePolicyCategoryDto,
  ): Promise<PolicyCategory> {
    const existingCategory = await this.policyCategoryModel.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Policy category not found');
    }

    if (updatePolicyCategoryDto.categoryName) {
      const conflictingCategory = await this.policyCategoryModel.findOne({
        categoryName: updatePolicyCategoryDto.categoryName,
        _id: { $ne: id },
      });

      if (conflictingCategory) {
        throw new ConflictException(
          'Policy category with this name already exists',
        );
      }
    }

    const updatedCategory = await this.policyCategoryModel
      .findByIdAndUpdate(id, updatePolicyCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Policy category not found');
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<{ message: string; deletedCategory: any }> {
    const category = await this.policyCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Policy category not found');
    }

    await this.policyCategoryModel.findByIdAndDelete(id).exec();

    return {
      message: 'Policy category deleted successfully',
      deletedCategory: {
        _id: category._id,
        categoryName: category.categoryName,
      },
    };
  }
}
