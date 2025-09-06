import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';
import { PolicyInfo } from './policy.schema';

@Injectable()
export class PolicyService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('PolicyInfo') private policyInfoModel: Model<PolicyInfo>,
  ) {}

  async findPolicyByUsername(username: string) {
    const user = await this.userModel.findOne({ firstName: username });
    if (!user) return [];
    return this.policyInfoModel.find({ userId: user._id });
  }

  async aggregatePoliciesByUser() {
    return this.policyInfoModel.aggregate([
      {
        $group: {
          _id: '$userId',
          policies: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
