# Semantic Search System

A full-stack Semantic Search application built using:

- Node.js + Express
- PostgreSQL + pgvector
- OpenSearch
- DuckDB Analytics
- HTML/CSS/JavaScript Frontend

This project demonstrates:

- Vector embeddings generation
- Semantic similarity search
- Keyword search
- OpenSearch integration
- Analytical queries using DuckDB
- Frontend search UI
- PostgreSQL query optimization

---

# Complete Project Documentation

This README contains:

- Project overview
- Architecture
- Backend explanation
- Frontend explanation
- PostgreSQL setup
- pgvector integration
- OpenSearch integration
- DuckDB analytics
- Important source files
- API endpoints
- Screenshots
- Setup instructions

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend Runtime |
| Express.js | API Server |
| PostgreSQL | Main Database |
| pgvector | Vector Similarity Search |
| OpenSearch | Search Engine |
| DuckDB | Analytics |
| HTML/CSS/JS | Frontend |

---

# Important Project Files

## 1. server.js

Main backend server built using Node.js and Express.

### Responsibilities

- PostgreSQL connection
- pgvector semantic search
- Embedding generation
- Full text search
- OpenSearch integration
- OpenSearch synchronization
- Filter APIs
- REST endpoints

### Main APIs

| Endpoint | Purpose |
|---|---|
| `/api/generate-embeddings` | Generate embeddings |
| `/api/search/vector` | Semantic vector search |
| `/api/search/keyword` | PostgreSQL keyword search |
| `/api/search/opensearch` | OpenSearch query |
| `/api/items` | Product filtering |
| `/api/opensearch/setup` | Create OpenSearch index |
| `/api/opensearch/sync` | Sync PostgreSQL → OpenSearch |

---

## Example Express Route

```javascript
app.get('/api/search/vector', async (req, res) => {

    const query = req.query.q;

    // Generate embedding
    // Perform vector similarity search
    // Return results

});
```

---

## 2. index.html

Frontend interface for the application.

### Features

- Product search
- Semantic search checkbox
- Filters
- Response time display
- Result count
- Dynamic rendering
- Fetch API integration

### Filters

- Product type
- Color
- Min price
- Max price

---

## Example Frontend API Call

```javascript
const response = await fetch(
    `http://localhost:3000/api/search/vector?q=${query}`
);

const data = await response.json();
```

---

## 3. analytics.py

DuckDB analytics benchmark script.

### Responsibilities

- Creates analytical tables
- Runs aggregation queries
- Measures execution time
- Demonstrates column-store analytics

---

## Example DuckDB Query

```sql
SELECT
    type,
    count(*) as sales,
    sum(price) as revenue
FROM items
GROUP BY type;
```

---

## 4. docker-compose.yml

Used to run OpenSearch using Docker.

### Services

- OpenSearch single-node cluster

---

# Project Structure

```text
project-root/
│
├── server.js
├── analytics.py
├── package.json
├── README.md
├── screenshots/
│   ├── frontend.png
│   ├── generate-embeddings.png
│   ├── vector-search-api.png
│   ├── frontend-search-empty.png
│   ├── frontend-vector-results.png
│   ├── postgres-query-results.png
│   ├── postgres-query-plan.png
│   ├── duckdb-results.png
│   ├── frontend-keyword-results.png
│   ├── frontend-semantic-results.png
│   ├── frontend-semantic-results-continued.png
│   ├── database-schema.png
│   ├── opensearch-running.png
│   ├── opensearch-setup-api.png
│   ├── opensearch-sync-api.png
│   └── opensearch-search-api.png
```

---

# Installation

## Clone Repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

---

## Install Dependencies

```bash
npm install
```

---

## Install PostgreSQL Extensions

Enable:

- pgvector

SQL:

```sql
CREATE EXTENSION vector;
```

---

# Database Setup

## Create Items Table

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    embedding vector(768)
);
```

---

## Additional Columns

```sql
ALTER TABLE items
ADD COLUMN type TEXT,
ADD COLUMN search_vector tsvector,
ADD COLUMN color TEXT,
ADD COLUMN category TEXT,
ADD COLUMN price NUMERIC;
```

---

# Run Backend

```bash
node server.js
```

Server runs at:

```text
http://localhost:3000
```

---

# Generate Embeddings

API:

```text
http://localhost:3000/api/generate-embeddings
```

---

# Vector Search API

Example:

```text
http://localhost:3000/api/search/vector?q=football shirt
```

---

# OpenSearch Setup

## Run OpenSearch

```bash
docker compose up
```

OpenSearch runs at:

```text
http://localhost:9200
```

---

## Setup Index

```text
http://localhost:3000/api/opensearch/setup
```

---

## Sync Data

```text
http://localhost:3000/api/opensearch/sync
```

---

## Search Data

```text
http://localhost:3000/api/search/opensearch?q=football shirt
```

---

# DuckDB Analytics

Run:

```bash
python3 analytics.py
```

---

# Screenshots

## Backend Running
![Backend Running](screenshots/frontend.png)

---

## Generate Embeddings API
![Generate Embeddings](screenshots/generate-embeddings.png)

---

## Vector Search API
![Vector Search API](screenshots/vector-search-api.png)

---

## Frontend Empty State
![Frontend Empty](screenshots/frontend-search-empty.png)

---

## Frontend Vector Search Results
![Frontend Vector Results](screenshots/frontend-vector-results.png)

---

## PostgreSQL Query Results
![Postgres Query Results](screenshots/postgres-query-results.png)

---

## PostgreSQL Query Plan
![Postgres Query Plan](screenshots/postgres-query-plan.png)

---

## DuckDB Analytics Results
![DuckDB Results](screenshots/duckdb-results.png)

---

## Frontend Keyword Search Results
![Frontend Keyword Results](screenshots/frontend-keyword-results.png)

---

## Frontend Semantic Search Results
![Frontend Semantic Results](screenshots/frontend-semantic-results.png)

---

## More Semantic Search Results
![More Semantic Results](screenshots/frontend-semantic-results-continued.png)

---

## Database Schema
![Database Schema](screenshots/database-schema.png)

---

## OpenSearch Running
![OpenSearch Running](screenshots/opensearch-running.png)

---

## OpenSearch Setup API
![OpenSearch Setup](screenshots/opensearch-setup-api.png)

---

## OpenSearch Sync API
![OpenSearch Sync](screenshots/opensearch-sync-api.png)

---

## OpenSearch Search API
![OpenSearch Search](screenshots/opensearch-search-api.png)

---

# Example Semantic Search

Input:

```text
football shirt
```

Result:

```text
German soccer jersey
```

This demonstrates semantic similarity instead of exact keyword matching.

---

# Future Improvements

- React frontend
- Better UI styling
- Image search support
- Hybrid ranking
- Authentication
- Real-time analytics dashboard

---

# Author

Preethi Chikkakalya Manjunath
