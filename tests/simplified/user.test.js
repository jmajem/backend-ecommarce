const { TestDataSource } = require('../../src/config/database.test');
const { UserTest } = require('../helpers/testEntities');

describe('User Entity Tests', () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
    await TestDataSource.synchronize(true);
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it('should create a user', async () => {
    const userRepository = TestDataSource.getRepository(UserTest);
    
    const testUser = userRepository.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '123-456-7890'
    });
    
    const savedUser = await userRepository.save(testUser);
    
    expect(savedUser).toHaveProperty('id');
    expect(savedUser.firstName).toBe('Test');
    expect(savedUser.lastName).toBe('User');
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.phoneNumber).toBe('123-456-7890');
  });
});