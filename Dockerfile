from --platform=linux/amd64 oven/bun

arg NODE_VERSION=18
run apt-get update && apt-get install -y curl default-mysql-client
run curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
run bash n $NODE_VERSION
run rm n
run npm install -g n

workdir /home/bun/app

copy package.json bun.lockb tsconfig.json .env .
copy prisma ./prisma
copy scripts/*.sh ./
copy src ./src

run chmod +x ./*.sh .env
run bun install --production
run bunx prisma generate

cmd ["bun", "start:prod"]
