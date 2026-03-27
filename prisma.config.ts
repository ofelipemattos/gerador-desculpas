import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

// Carrega o .env manualmente — necessário pois o prisma.config.ts ignora o .env por padrão
config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
