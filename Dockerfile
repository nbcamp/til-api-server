from --platform=linux/amd64 oven/bun

arg NODE_VERSION=18
run apt-get update && apt-get install -y curl
run curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
run bash n $NODE_VERSION
run rm n
run npm install -g n

# TODO: 환경 변수 설정
env PORT 8080
env NODE_ENV local
env TZ Asia/Seoul
env DATABASE_URL file:./dev.db
env JWT_SECRET my-secret

workdir /home/bun/app

copy package.json bun.lockb .
copy tsconfig.json .
copy prisma ./prisma
copy src ./src

run bun install --production
run bunx prisma generate
run bun migrate

cmd ["bun", "start:prod"]
