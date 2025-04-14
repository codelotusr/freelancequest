FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY . .

RUN pnpm install

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]

