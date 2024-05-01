const request = require('supertest');
const { app, server } = require('../server'); // Assuming your Express app is exported from app.js
const { getAllProducts } = require('../controllers/userController');
const Product = require('../models/productModal');
const connectDB = require('../DB/db'); // Import the function to connect to the database
const { default: mongoose } = require('mongoose');

describe('getAllProducts', () => {

    beforeAll(async () => {
      await connectDB();
    });

    test('should return status 400 if no products exist', async () => {

        Product.find = jest.fn().mockResolvedValue([]);

        const response = await request(app).post('/api/user/getAllProducts');

        expect(response.status).toBe(400);

        expect(response.body).toEqual({ error: 'Failed to fetch products !!!' });
    });

    test('should return status 201 and products if products exist', async () => {

    Product.find = jest.fn().mockResolvedValue([
      { _id: 1, productTitle: 'Product 1', categoryName:"category 1", description:"description 1",
       shopId:"001", price: 10},
      { _id: 2, productTitle: 'Product 2', categoryName:"category 2", description:"description 2",
       shopId:"002", price: 20},
    ]);

    const response = await request(app).post('/api/user/getAllProducts');

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      Products: [
        {  _id: 1, productTitle: 'Product 1', categoryName:"category 1", description:"description 1",
        shopId:"001", price: 10},
        { _id: 2, productTitle: 'Product 2', categoryName:"category 2", description:"description 2",
        shopId:"002", price: 20},
      ],
    });

    });

    afterAll(async () => {
        server.close();

        await mongoose.disconnect()
      });
});
  
