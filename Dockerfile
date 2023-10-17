from --platform=linux/amd64 oven/bun

copy . .

run bun install --production
run bunx prisma generate

cmd ["bun", "start:prod"]
