const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: ''
});
async function initializeDatabase() {
    await pool.query(`
        CREATE DATABASE IF NOT EXISTS retail_store
    `);
    const db = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'retail_store'
    });
    await db.query(`
        CREATE TABLE IF NOT EXISTS Suppliers (
            SupplierID INT PRIMARY KEY AUTO_INCREMENT,
            SupplierName VARCHAR(255),
            ContactNumber VARCHAR(50)
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS Products (
            ProductID INT PRIMARY KEY AUTO_INCREMENT,
            ProductName VARCHAR(255),
            Price DECIMAL(10,2),
            StockQuantity INT,
            SupplierID INT,
            FOREIGN KEY (SupplierID)
            REFERENCES Suppliers(SupplierID)
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS Sales (
            SaleID INT PRIMARY KEY AUTO_INCREMENT,
            ProductID INT,
            QuantitySold INT,
            SaleDate DATE,
            FOREIGN KEY (ProductID)
            REFERENCES Products(ProductID)
        )
    `);

    console.log('Database and tables are ready!');

    return db;
}
app.post('/products', async (req, res) => {

    const {
        ProductName,
        Price,
        StockQuantity,
        SupplierID
    } = req.body;

    const sql = `
        INSERT INTO Products
        (ProductName, Price, StockQuantity, SupplierID)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(
        sql,
        [ProductName, Price, StockQuantity, SupplierID]
    );

    res.json({
        message: 'Product added',
        ProductID: result.insertId
    });
});
app.get('/products', async (req, res) => {

    const [results] = await db.query(
        'SELECT * FROM Products'
    );

    res.json(results);
});
app.get('/products/:id', async (req, res) => {

    const [results] = await db.query(
        'SELECT * FROM Products WHERE ProductID = ?',
        [req.params.id]
    );

    res.json(results);
});
app.put('/products/:id', async (req, res) => {

    const {
        ProductName,
        Price,
        StockQuantity,
        SupplierID
    } = req.body;

    const sql = `
        UPDATE Products
        SET ProductName = ?,
            Price = ?,
            StockQuantity = ?,
            SupplierID = ?
        WHERE ProductID = ?
    `;

    await db.query(
        sql,
        [
            ProductName,
            Price,
            StockQuantity,
            SupplierID,
            req.params.id
        ]
    );

    res.json({
        message: 'Product updated'
    });
});
app.delete('/products/:id', async (req, res) => {

    await db.query(
        'DELETE FROM Products WHERE ProductID = ?',
        [req.params.id]
    );

    res.json({
        message: 'Product deleted'
    });
});
app.post('/suppliers', async (req, res) => {

    const {
        SupplierName,
        ContactNumber
    } = req.body;

    const sql = `
        INSERT INTO Suppliers
        (SupplierName, ContactNumber)
        VALUES (?, ?)
    `;

    const [result] = await db.query(
        sql,
        [SupplierName, ContactNumber]
    );

    res.json({
        message: 'Supplier added',
        SupplierID: result.insertId
    });
});
app.get('/suppliers', async (req, res) => {

    const [results] = await db.query(
        'SELECT * FROM Suppliers'
    );

    res.json(results);
});
app.put('/suppliers/:id', async (req, res) => {

    const {
        SupplierName,
        ContactNumber
    } = req.body;

    const sql = `
        UPDATE Suppliers
        SET SupplierName = ?,
            ContactNumber = ?
        WHERE SupplierID = ?
    `;

    await db.query(
        sql,
        [
            SupplierName,
            ContactNumber,
            req.params.id
        ]
    );

    res.json({
        message: 'Supplier updated'
    });
});
app.delete('/suppliers/:id', async (req, res) => {

    await db.query(
        'DELETE FROM Suppliers WHERE SupplierID = ?',
        [req.params.id]
    );

    res.json({
        message: 'Supplier deleted'
    });
});
app.post('/sales', async (req, res) => {

    const {
        ProductID,
        QuantitySold,
        SaleDate
    } = req.body;

    const sql = `
        INSERT INTO Sales
        (ProductID, QuantitySold, SaleDate)
        VALUES (?, ?, ?)
    `;

    const [result] = await db.query(
        sql,
        [
            ProductID,
            QuantitySold,
            SaleDate
        ]
    );

    res.json({
        message: 'Sale added',
        SaleID: result.insertId
    });
});
app.get('/sales', async (req, res) => {

    const [results] = await db.query(
        'SELECT * FROM Sales'
    );

    res.json(results);
});
app.get('/sales/product/:id', async (req, res) => {

    const [results] = await db.query(
        'SELECT * FROM Sales WHERE ProductID = ?',
        [req.params.id]
    );

    res.json(results);
});
app.post('/database/add-category', async (req, res) => {

    await db.query(`
        ALTER TABLE Products
        ADD COLUMN Category VARCHAR(100)
    `);

    res.json({
        message: 'Category column added'
    });
});
app.delete('/database/remove-category', async (req, res) => {

    await db.query(`
        ALTER TABLE Products
        DROP COLUMN Category
    `);

    res.json({
        message: 'Category column removed'
    });
});
app.put('/database/contact-number', async (req, res) => {

    await db.query(`
        ALTER TABLE Suppliers
        MODIFY ContactNumber VARCHAR(15)
    `);

    res.json({
        message: 'ContactNumber changed to VARCHAR(15)'
    });
});
app.put('/database/product-name-not-null', async (req, res) => {

    await db.query(`
        ALTER TABLE Products
        MODIFY ProductName VARCHAR(255) NOT NULL
    `);

    res.json({
        message: 'ProductName is now NOT NULL'
    });
});
app.post('/insert-data', async (req, res) => {    const [supplier] = await db.query(`
        INSERT INTO Suppliers
        (SupplierName, ContactNumber)
        VALUES ('FreshFoods', '01001234567')
    `);

    const supplierID = supplier.insertId;
    await db.query(`
        INSERT INTO Products
        (ProductName, Price, StockQuantity, SupplierID)
        VALUES ('Milk', 15.00, 50, ?)
    `, [supplierID]);
    await db.query(`
        INSERT INTO Products
        (ProductName, Price, StockQuantity, SupplierID)
        VALUES ('Bread', 10.00, 30, ?)
    `, [supplierID]);
    await db.query(`
        INSERT INTO Products
        (ProductName, Price, StockQuantity, SupplierID)
        VALUES ('Eggs', 20.00, 40, ?)
    `, [supplierID]);
    const [milk] = await db.query(`
        SELECT ProductID
        FROM Products
        WHERE ProductName = 'Milk'
    `);
    await db.query(`
        INSERT INTO Sales
        (ProductID, QuantitySold, SaleDate)
        VALUES (?, 2, '2025-05-20')
    `, [milk[0].ProductID]);


    res.json({
        message: 'Required data inserted'
    });
});
app.put('/bread-price', async (req, res) => {

    await db.query(`
        UPDATE Products
        SET Price = 25.00
        WHERE ProductName = 'Bread'
    `);

    res.json({
        message: 'Bread price updated to 25'
    });
});
app.delete('/eggs', async (req, res) => {

    await db.query(`
        DELETE FROM Products
        WHERE ProductName = 'Eggs'
    `);

    res.json({
        message: 'Eggs deleted'
    });
});
app.get('/reports/total-sold', async (req, res) => {

    const [results] = await db.query(`
        SELECT ProductID,
               SUM(QuantitySold) AS TotalQuantitySold
        FROM Sales
        GROUP BY ProductID
    `);

    res.json(results);
});
app.get('/reports/highest-stock', async (req, res) => {

    const [results] = await db.query(`
        SELECT *
        FROM Products
        ORDER BY StockQuantity DESC
        LIMIT 1
    `);

    res.json(results);
});
app.get('/reports/suppliers-f', async (req, res) => {

    const [results] = await db.query(`
        SELECT *
        FROM Suppliers
        WHERE SupplierName LIKE 'F%'
    `);

    res.json(results);
});
app.get('/reports/never-sold', async (req, res) => {

    const [results] = await db.query(`
        SELECT Products.*
        FROM Products
        LEFT JOIN Sales
        ON Products.ProductID = Sales.ProductID
        WHERE Sales.ProductID IS NULL
    `);

    res.json(results);
});
app.get('/reports/sales-details', async (req, res) => {

    const [results] = await db.query(`
        SELECT
            Products.ProductName,
            Sales.QuantitySold,
            Sales.SaleDate
        FROM Sales
        JOIN Products
        ON Sales.ProductID = Products.ProductID
    `);

    res.json(results);
});
let db;

initializeDatabase().then((database) => {

    db = database;

    app.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });

});