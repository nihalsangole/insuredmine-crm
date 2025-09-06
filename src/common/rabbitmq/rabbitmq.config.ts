import { ConfigService } from '@nestjs/config';

export const getRabbitMQConfig = (configService: ConfigService) => ({
  transport: 'amqp',
  options: {
    urls: [configService.get('RABBITMQ_URL') || 'amqp://localhost:5672'],
    queue: 'message_queue',
    queueOptions: {
      durable: true,
    },
    socketOptions: {
      heartbeatIntervalInSeconds: 60,
      reconnectTimeInSeconds: 5,
    },
  },
});

export const RABBITMQ_QUEUE = 'message_queue';
export const RABBITMQ_DELAYED_QUEUE = 'message_delayed_queue';
