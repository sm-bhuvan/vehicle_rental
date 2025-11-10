// Use require for CommonJS modules
const User = require('../models/User');

describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9999999999',
      password: 'plainpass'
    });

    await user.save();

    expect(user.password).not.toBe('plainpass');
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should match correct password', async () => {
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1111111111',
      password: 'testpassword'
    });

    await user.save();
    const isMatch = await user.matchPassword('testpassword');
    expect(isMatch).toBe(true);
  });

  it('should fail to match wrong password', async () => {
    const user = new User({
      firstName: 'Test',
      lastName: 'User2',
      email: 'test2@example.com',
      phone: '2222222222',
      password: 'correctpassword'
    });

    await user.save();
    const isMatch = await user.matchPassword('wrongpassword');
    expect(isMatch).toBe(false);
  });

  it('should not rehash password if unchanged', async () => {
    const user = new User({
      firstName: 'Test',
      lastName: 'User3',
      email: 'test3@example.com',
      phone: '3333333333',
      password: 'originalpass'
    });

    await user.save();
    const originalHash = user.password;
    user.firstName = 'Updated';
    await user.save();
    expect(user.password).toBe(originalHash);
  });

  it('should create user with required fields', async () => {
    const user = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '8888888888',
      password: 'password123'
    });

    await user.save();

    expect(user._id).toBeDefined();
    expect(user.firstName).toBe('Jane');
    expect(user.lastName).toBe('Smith');
    expect(user.email).toBe('jane@example.com');
    expect(user.role).toBe('user');
    expect(user.isVerified).toBe(false);
  });

  it('should rehash password when password is changed', async () => {
    const user = new User({
      firstName: 'Test',
      lastName: 'User4',
      email: 'test4@example.com',
      phone: '4444444444',
      password: 'oldpassword'
    });

    await user.save();
    const oldHash = user.password;
    user.password = 'newpassword';
    await user.save();
    expect(user.password).not.toBe(oldHash);
    
    const isMatch = await user.matchPassword('newpassword');
    expect(isMatch).toBe(true);
  });
});
