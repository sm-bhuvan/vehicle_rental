import request from 'supertest';
import express from 'express';

// Use require for CommonJS modules
const bookingsRouter = require('../routes/bookings');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const app: any = express();
app.use(express.json());
app.use('/bookings', bookingsRouter);

describe('POST /bookings/create-direct', () => {
  let testVehicle: any;

  beforeEach(async () => {
    // Create a test vehicle
    testVehicle = new Vehicle({
      make: 'Honda',
      model: 'City',
      year: 2022,
      type: 'car',
      registration_number: 'TEST123',
      location: 'Test Location',
      description: 'Test vehicle',
      pricePerDay: 1000,
      pricePerHour: 100,
      isAvailable: true,
      isActive: true
    });
    await testVehicle.save();
  });

  it('should create a booking successfully', async () => {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 3);

    const res = await request(app)
      .post('/bookings/create-direct')
      .send({
        vehicleId: testVehicle._id.toString(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9999999999',
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        transactionRef: 'TX12345',
        paymentAmount: 2000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('bookingId');
    expect(res.body.data.bookingId).toMatch(/^BKG/);
  });

  it('should return validation error for missing fields', async () => {
    const res = await request(app).post('/bookings/create-direct').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('should return validation error for invalid email', async () => {
    const res = await request(app)
      .post('/bookings/create-direct')
      .send({
        vehicleId: testVehicle._id.toString(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '9999999999',
        pickupDate: new Date().toISOString(),
        returnDate: new Date().toISOString(),
        transactionRef: 'TX12345',
        paymentAmount: 2000
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});