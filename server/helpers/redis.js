import redis from 'redis';

// Simply pass the port that you want a Redis server to listen on.
const client = redis.createClient(6379, process.env.REDIS_URL || '127.0.0.1'); // creates a new client

client.on('connect', () => {
  console.log('Redis connected!');
});

export default client;
