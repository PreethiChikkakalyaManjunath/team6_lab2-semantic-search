const express = require('express');
const cors = require('cors');
const axios = require('axios');

const { Pool } = require('pg');

const {
    Client
} = require('@opensearch-project/opensearch');

const app = express();

app.use(cors());
app.use(express.json());


// --------------------------------------------------
// PostgreSQL
// --------------------------------------------------

const pool = new Pool({
    user: 'preethimanjunath',
    host: 'localhost',
    database: 'semantic_search',
    port: 5432
});


// --------------------------------------------------
// OpenSearch
// --------------------------------------------------

const osClient = new Client({
    node: 'http://localhost:9200'
});


// --------------------------------------------------
// Home
// --------------------------------------------------

app.get('/', (req, res) => {
    res.send('Semantic Search API Running');
});


// --------------------------------------------------
// Generate embeddings
// --------------------------------------------------

app.get('/api/generate-embeddings', async (req, res) => {

    try {

        const items = await pool.query(`
            SELECT id, title, description
            FROM items
        `);

        for (const item of items.rows) {

            const text =
                `${item.title} ${item.description}`;

            console.log(`Generating embedding for: ${text}`);

            const embeddingResponse = await axios.post(
                'https://db.iue.haw-kiel.de/ollama/api/embeddings',
                {
                    model: 'nomic-embed-text-v2-moe:latest',
                    prompt: text
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': '42'
                    }
                }
            );

            const embedding =
                embeddingResponse.data.embedding;

            await pool.query(`
                UPDATE items
                SET embedding = $1
                WHERE id = $2
            `, [JSON.stringify(embedding), item.id]);

        }

        res.json({
            message: 'Embeddings generated successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Embedding generation failed'
        });
    }
});


// --------------------------------------------------
// Vector semantic search
// --------------------------------------------------

app.get('/api/search/vector', async (req, res) => {

    try {

        const query = req.query.q;

        const start = Date.now();

        const embeddingResponse = await axios.post(
            'https://db.iue.haw-kiel.de/ollama/api/embeddings',
            {
                model: 'nomic-embed-text-v2-moe:latest',
                prompt: query
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': '42'
                }
            }
        );

        const embedding =
            embeddingResponse.data.embedding;

        const result = await pool.query(`
            SELECT
                id,
                title,
                description,
                type,
                color,
                category,
                price,
                embedding <=> $1 AS distance
            FROM items
            WHERE embedding IS NOT NULL
            ORDER BY distance
            LIMIT 10
        `, [JSON.stringify(embedding)]);

        const end = Date.now();

        res.json({
            responseTimeMs: end - start,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Semantic search failed'
        });
    }
});


// --------------------------------------------------
// PostgreSQL Full Text Search
// --------------------------------------------------

app.get('/api/search/keyword', async (req, res) => {

    try {

        const query = req.query.q;

        const start = Date.now();

        const result = await pool.query(`
            SELECT
                id,
                title,
                description,
                type,
                color,
                category,
                price,
                ts_rank(
                    search_vector,
                    websearch_to_tsquery($1)
                ) AS rank
            FROM items
            WHERE search_vector @@ websearch_to_tsquery($1)
            ORDER BY rank DESC
            LIMIT 10
        `, [query]);

        const end = Date.now();

        res.json({
            responseTimeMs: end - start,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Keyword search failed'
        });
    }
});


// --------------------------------------------------
// Catalog filters
// --------------------------------------------------

app.get('/api/items', async (req, res) => {

    try {

        let query = `
            SELECT *
            FROM items
            WHERE 1=1
        `;

        let values = [];

        let index = 1;

        if (req.query.type) {

            query += ` AND type = $${index++}`;

            values.push(req.query.type);
        }

        if (req.query.color) {

            query += ` AND color = $${index++}`;

            values.push(req.query.color);
        }

        if (req.query.category) {

            query += ` AND category = $${index++}`;

            values.push(req.query.category);
        }

        if (req.query.minPrice) {

            query += ` AND price >= $${index++}`;

            values.push(req.query.minPrice);
        }

        if (req.query.maxPrice) {

            query += ` AND price <= $${index++}`;

            values.push(req.query.maxPrice);
        }

        const start = Date.now();

        const result = await pool.query(query, values);

        const end = Date.now();

        res.json({
            responseTimeMs: end - start,
            count: result.rows.length,
            results: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'Filter query failed'
        });
    }
});


// --------------------------------------------------
// OpenSearch setup
// --------------------------------------------------

app.get('/api/opensearch/setup', async (req, res) => {

    try {

        const exists =
            await osClient.indices.exists({
                index: 'items'
            });

        if (!exists.body) {

            await osClient.indices.create({

                index: 'items',

                body: {

                    mappings: {

                        properties: {

                            title: {
                                type: 'text'
                            },

                            description: {
                                type: 'text'
                            },

                            type: {
                                type: 'keyword'
                            },

                            color: {
                                type: 'keyword'
                            },

                            category: {
                                type: 'keyword'
                            },

                            price: {
                                type: 'float'
                            }
                        }
                    }
                }
            });
        }

        res.json({
            message: 'OpenSearch index ready'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'OpenSearch setup failed'
        });
    }
});


// --------------------------------------------------
// Sync PostgreSQL -> OpenSearch
// --------------------------------------------------

app.get('/api/opensearch/sync', async (req, res) => {

    try {

        const items = await pool.query(`
            SELECT *
            FROM items
        `);

        for (const item of items.rows) {

            await osClient.index({

                index: 'items',

                id: item.id,

                body: {

                    title: item.title,

                    description: item.description,

                    type: item.type,

                    color: item.color,

                    category: item.category,

                    price: item.price
                },

                refresh: true
            });
        }

        res.json({
            message: 'Data synced to OpenSearch'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'OpenSearch sync failed'
        });
    }
});


// --------------------------------------------------
// OpenSearch keyword search
// --------------------------------------------------

app.get('/api/search/opensearch', async (req, res) => {

    try {

        const query = req.query.q;

        const start = Date.now();

        const result = await osClient.search({

            index: 'items',

            body: {

                query: {

                    multi_match: {

                        query: query,

                        fields: [
                            'title',
                            'description'
                        ]
                    }
                }
            }
        });

        const end = Date.now();

        const hits =
            result.body.hits.hits.map(hit => ({

                id: hit._id,

                score: hit._score,

                ...hit._source
            }));

        res.json({

            responseTimeMs: end - start,

            count: hits.length,

            results: hits
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: 'OpenSearch search failed'
        });
    }
});


// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
