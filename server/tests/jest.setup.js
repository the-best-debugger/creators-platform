const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test' && !process.env.MONGODB_URI_TEST) {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI_TEST = mongoServer.getUri();
  }
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});
