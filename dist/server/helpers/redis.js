'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Simply pass the port that you want a Redis server to listen on.
var client = _redis2.default.createClient(6379, process.env.REDIS_URL || '127.0.0.1'); // creates a new client

client.on('connect', function () {
  console.log('Redis connected!');
});

exports.default = client;
module.exports = exports['default'];
//# sourceMappingURL=redis.js.map
