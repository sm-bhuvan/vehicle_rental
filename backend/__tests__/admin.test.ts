import request from 'supertest';
import express from 'express';

// Mock the auth middleware before importing routes
jest.mock('../middlewares/auth', () => ({
  adminAuth: (req: any, res: any, next: any) => {
    // Set a mock user for testing
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  },
  auth: (req: any, res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  },
  generateToken: (userId: string) => 'mock-token',
}));

// Use require for CommonJS modules after mocking
const adminRouter = require('../routes/admin');

const app: any = express();
app.use(express.json());
app.use('/admin', adminRouter);

describe('Admin Routes', () => {
  test('GET /admin/dashboard should return stats', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('overview');
  });

  test('GET /admin/users should return user list', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('pagination');
  });

  test('PATCH /admin/users/:id/status with invalid id should return 404 or 500', async () => {
    const res = await request(app)
      .patch('/admin/users/507f1f77bcf86cd799439011/status')
      .send({ isVerified: true });
    // Should return 404 if user not found, or 500 if invalid ObjectId format
    expect([404, 500]).toContain(res.statusCode);
  });

  test('GET /admin/reports with invalid type should fail', async () => {
    const res = await request(app).get('/admin/reports?type=invalid');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('GET /admin/reports with valid type should succeed', async () => {
    const res = await request(app).get('/admin/reports?type=rentals');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('type', 'rentals');
  });
});
