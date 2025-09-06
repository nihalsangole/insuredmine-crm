import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PolicyCarrier } from './policy-carrier.schema';
import { CreatePolicyCarrierDto } from './dto/create-policyCarrier.dto';
import { UpdatePolicyCarrierDto } from './dto/update-policyCarrier.dto';

@Injectable()
export class PolicyCarrierService {
  constructor(
    @InjectModel(PolicyCarrier.name)
    private policyCarrierModel: Model<PolicyCarrier>,
  ) {}

  async create(
    createPolicyCarrierDto: CreatePolicyCarrierDto,
  ): Promise<PolicyCarrier> {
    const existingCarrier = await this.policyCarrierModel.findOne({
      companyName: createPolicyCarrierDto.companyName,
    });

    if (existingCarrier) {
      throw new ConflictException(
        'Policy carrier with this name already exists',
      );
    }

    const createdCarrier = new this.policyCarrierModel(createPolicyCarrierDto);
    return createdCarrier.save();
  }

  async findAll(search?: string): Promise<PolicyCarrier[]> {
    const query: any = {};

    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }

    return this.policyCarrierModel.find(query).exec();
  }

  async findOne(id: string): Promise<PolicyCarrier> {
    const carrier = await this.policyCarrierModel.findById(id).exec();
    if (!carrier) {
      throw new NotFoundException('Policy carrier not found');
    }
    return carrier;
  }

  async update(
    id: string,
    updatePolicyCarrierDto: UpdatePolicyCarrierDto,
  ): Promise<PolicyCarrier> {
    const existingCarrier = await this.policyCarrierModel.findById(id);
    if (!existingCarrier) {
      throw new NotFoundException('Policy carrier not found');
    }

    if (updatePolicyCarrierDto.companyName) {
      const conflictingCarrier = await this.policyCarrierModel.findOne({
        companyName: updatePolicyCarrierDto.companyName,
        _id: { $ne: id },
      });

      if (conflictingCarrier) {
        throw new ConflictException(
          'Policy carrier with this name already exists',
        );
      }
    }

    const updatedCarrier = await this.policyCarrierModel
      .findByIdAndUpdate(id, updatePolicyCarrierDto, { new: true })
      .exec();

    if (!updatedCarrier) {
      throw new NotFoundException('Policy carrier not found');
    }

    return updatedCarrier;
  }

  async remove(id: string): Promise<{ message: string; deletedCarrier: any }> {
    const carrier = await this.policyCarrierModel.findById(id);
    if (!carrier) {
      throw new NotFoundException('Policy carrier not found');
    }

    await this.policyCarrierModel.findByIdAndDelete(id).exec();

    return {
      message: 'Policy carrier deleted successfully',
      deletedCarrier: {
        _id: carrier._id,
        companyName: carrier.companyName,
      },
    };
  }
}
