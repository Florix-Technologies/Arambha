-- SQL schema for ecommerce backend

-- Table 1: furniture
CREATE TABLE furniture (
    product_id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL, -- URL to Firebase Storage
    name VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    product_type VARCHAR(100) -- e.g., sofa, table, etc.
);

-- Table 2: interior
CREATE TABLE interior (
    interior_id SERIAL PRIMARY KEY,
    subcategory VARCHAR(100) NOT NULL, -- e.g., bedroom, kitchen, livingroom
    category VARCHAR(100) NOT NULL     -- e.g., aluminum, wooden
);

-- Table 3: design
CREATE TABLE design (
    design_id SERIAL PRIMARY KEY,
    details TEXT -- Add more columns as needed
);
