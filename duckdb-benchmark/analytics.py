import duckdb
import time

con = duckdb.connect('analytics.db')

# Create tables
con.execute("""
CREATE TABLE items (
    id INTEGER,
    type VARCHAR
)
""")

con.execute("""
CREATE TABLE sales (
    item_id INTEGER,
    sale_price DOUBLE,
    review_date DATE,
    return_date DATE
)
""")

# Insert items
con.execute("""
INSERT INTO items VALUES
(1, 'Sports'),
(2, 'Footwear'),
(3, 'Electronics'),
(4, 'Clothing')
""")

# Insert sales
con.execute("""
INSERT INTO sales VALUES
(1, 99.99, '2025-01-01', NULL),
(1, 89.99, '2025-01-02', NULL),
(2, 120.00, '2025-01-03', '2025-01-10'),
(3, 1500.00, NULL, NULL),
(4, 200.00, '2025-01-04', NULL)
""")

# Benchmark query
start = time.time()

result = con.execute("""
SELECT
    type,
    count(*) as sales,
    sum(sale_price) as revenue,
    count(review_date) as reviews,
    count(return_date) as returns
FROM items i
JOIN sales s ON i.id = s.item_id
GROUP BY type
ORDER BY revenue desc
LIMIT 10;
""").fetchall()

end = time.time()

print(result)

print("Execution Time:", end - start)
