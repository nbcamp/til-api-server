# 티로그 API Server

[API Documentation (Postman)](https://documenter.getpostman.com/view/30710555/2s9YXiZh7j)

## Development

### Getting Started

Clone the repository:

```bash
$ git clone https://github.com/nbcamp/tlog-api.git
$ cd tlog-api
```

Install dependencies(using [Bun](https://bun.sh)):

```bash
$ bun install
```

Start the server:

```bash
$ bun run start:dev
```

### Environment Variables

Set environment variables in `.env` file:

```bash
$ cp .env.example .env
```

For more information, see [`.env.example`](./.env.example).

### Scripts

```bash
# Start the server in development mode
$ bun run start:dev

# Migrate database
$ bun run migrate:dev

# Update packages
$ bun run update

# Lint code
$ bun run lint

# Check types
$ bun run tsc
```

---

## [Database Schema](https://dbdiagram.io/d/티로그-6526132fffbf5169f071fe0c)

![Database Schema](./assets/schema.png)

## Features

- Restful API
- Postman Documentation
- FileSystem-Based API Routing
- Body(JSON) Validation

## Architecture

```mermaid
---
title: Tech Architecture Diagram
---
graph TD
  subgraph ServerDockerContainer[Docker Container]
      BunJS[Bun.js Server]
  end

  subgraph MySQLDockerContainer[Docker Container]
      MySQL[(MySQL)]
  end

  subgraph EC2
      ServerDockerContainer
      MySQLDockerContainer
  end

  subgraph S3
      Images(Images)
  end

  subgraph AWS
      EC2
      S3
  end

  subgraph Clients
      User1([User1])
      User2([User2])
      User3([User3])
  end

  subgraph Github
      ClientRepo[Client Repo: Swift]
      ServerRepo[Server Repo: JS]
      GithubAction[[Github Action]]
  end

  subgraph DockerHub
      BunJsImage(Bun.js Image)
      MySQLImage(MySQL Image)
  end

  ClientRepo --Deploy--> AppStore((App Store))
  AppStore --Distribute--> Clients
  Clients <--HTTP--> BunJS
  Clients --Get Images--> S3

  ServerRepo --Push to main branch--> GithubAction
  GithubAction --Deploy using SSH--> EC2
  BunJS <--Prisma ORM--> MySQL

  GithubAction --Build and Push Image--> BunJsImage
  BunJsImage --Pull Image--> BunJS
  MySQLImage --Pull Image--> MySQL

  BunJS --Save Images--> S3

  style ClientRepo fill:#f9d9ff,stroke:#333,stroke-width:2px
  style BunJS fill:#d9f9ff,stroke:#333,stroke-width:2px
  style MySQL fill:#d9f9ff,stroke:#333,stroke-width:2px
  style ClientRepo fill:#d9ffd9,stroke:#333,stroke-width:2px
  style ServerRepo fill:#d9ffd9,stroke:#333,stroke-width:2px
  style BunJsImage fill:#ffd9d9,stroke:#333,stroke-width:2px
  style MySQLImage fill:#ffd9d9,stroke:#333,stroke-width:2px
  style GithubAction fill:#ffffff,stroke:#333,stroke-width:2px
  style User1 fill:#FAF6F0,stroke:#333,stroke-width:2px
  style User2 fill:#FAF6F0,stroke:#333,stroke-width:2px
  style User3 fill:#FAF6F0,stroke:#333,stroke-width:2px
```
