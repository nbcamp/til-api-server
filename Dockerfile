from --platform=linux/amd64 oven/bun

copy . .

arg NODE_VERSION=18
run apt update && apt install -y curl
run curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
run bash n $NODE_VERSION
run rm n
run npm install -g n

run bun install --production
run bunx prisma generate

cmd ["bun", "start:prod"]
