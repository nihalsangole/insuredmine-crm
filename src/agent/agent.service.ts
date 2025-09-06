import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from './agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(@InjectModel(Agent.name) private agentModel: Model<Agent>) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    // check if agent exists already - dont want dupes
    const existingAgent = await this.agentModel.findOne({
      agentName: createAgentDto.agentName,
    });

    if (existingAgent) {
      throw new ConflictException('Agent with this name already exists');
    }

    const createdAgent = new this.agentModel(createAgentDto);
    return createdAgent.save();
  }

  async findAll(search?: string): Promise<Agent[]> {
    const query: any = {};

    // basic search - could improve this later
    if (search) {
      query.agentName = { $regex: search, $options: 'i' };
    }

    return this.agentModel.find(query).exec();
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentModel.findById(id).exec();
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    // check if agent exists
    const existingAgent = await this.agentModel.findById(id);
    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    // check if new name conflicts with existing agents
    if (updateAgentDto.agentName) {
      const conflictingAgent = await this.agentModel.findOne({
        agentName: updateAgentDto.agentName,
        _id: { $ne: id },
      });

      if (conflictingAgent) {
        throw new ConflictException('Agent with this name already exists');
      }
    }

    const updatedAgent = await this.agentModel
      .findByIdAndUpdate(id, updateAgentDto, { new: true })
      .exec();

    if (!updatedAgent) {
      throw new NotFoundException('Agent not found');
    }

    return updatedAgent;
  }

  async remove(id: string): Promise<{ message: string; deletedAgent: any }> {
    const agent = await this.agentModel.findById(id);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    await this.agentModel.findByIdAndDelete(id).exec();

    return {
      message: 'Agent deleted successfully',
      deletedAgent: {
        _id: agent._id,
        agentName: agent.agentName,
      },
    };
  }
}
