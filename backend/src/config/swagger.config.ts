import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Storyteller API')
  .setDescription('API for Storyteller')
  .setVersion(process.env.VERSION || '1.0')
  .build();
