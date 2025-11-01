# Video Editor Server

Backend server for the React Video Editor project. Provides CRUD API for managing video timeframes (groups).

## Tech Stack

- **NestJS** (Node.js framework)
- **TypeORM** (ORM for PostgreSQL)
- **PostgreSQL** (Database)
- **Docker** (for database container)
- **Jest** (Unit testing)
- **TypeScript** (Language)

## Features

- CRUD operations for `Groups` (timeframe selections)
- Database integration via TypeORM
- Unit tests for Groups service

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker
- npm

### Installation

1. Clone the repository (server part):

```bash
git clone https://github.com/mykytapilec/video-editor.git
cd video-editor/server

2. Install dependencies:

npm install

3. Start PostgreSQL via Docker:

docker run --name video-editor-db \
  -e POSTGRES_USER=ve_user \
  -e POSTGRES_PASSWORD=ve_pass \
  -e POSTGRES_DB=ve_db \
  -p 5432:5432 \
  -d postgres:15

4. Start the server:

npm run start:dev

Server will run on http://localhost:3001.

5. Running Tests

npm test

6. API Endpoints

GET /groups – List all groups
GET /groups/:id – Get group by ID
POST /groups – Create new group
PUT /groups/:id – Update group
DELETE /groups/:id – Delete group

7. Notes

Make sure the database is running before starting the server.
Unit tests cover the Groups service.