import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account } from './account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // check if account exists already
    const existingAccount = await this.accountModel.findOne({
      accountName: createAccountDto.accountName,
    });

    if (existingAccount) {
      throw new ConflictException('Account with this name already exists');
    }

    const createdAccount = new this.accountModel(createAccountDto);
    return createdAccount.save();
  }

  async findAll(search?: string): Promise<Account[]> {
    const query: any = {};

    if (search) {
      query.accountName = { $regex: search, $options: 'i' };
    }

    return this.accountModel.find(query).exec();
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountModel.findById(id).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    // check if account exists
    const existingAccount = await this.accountModel.findById(id);
    if (!existingAccount) {
      throw new NotFoundException('Account not found');
    }

    // check if new name conflicts with existing accounts
    if (updateAccountDto.accountName) {
      const conflictingAccount = await this.accountModel.findOne({
        accountName: updateAccountDto.accountName,
        _id: { $ne: id },
      });

      if (conflictingAccount) {
        throw new ConflictException('Account with this name already exists');
      }
    }

    const updatedAccount = await this.accountModel
      .findByIdAndUpdate(id, updateAccountDto, { new: true })
      .exec();

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return updatedAccount;
  }

  async remove(id: string): Promise<{ message: string; deletedAccount: any }> {
    const account = await this.accountModel.findById(id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.accountModel.findByIdAndDelete(id).exec();

    return {
      message: 'Account deleted successfully',
      deletedAccount: {
        _id: account._id,
        accountName: account.accountName,
      },
    };
  }
}
