// const rateLimit = require('express-rate-limit');
// exports.apiLimiter = rateLimit({ windowMs:15*60*1000, max:200, message:{ message:'Too many requests, please try again later.' } });
// exports.authLimiter = rateLimit({ windowMs:15*60*1000, max:20, message:{ message:'Too many auth attempts, try again in 15 minutes.' } });
// exports.chatLimiter = rateLimit({ windowMs:60*1000, max:30, message:{ message:'Too many messages, slow down.' } });


const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000000000, // 100 करोड़ requests
});

exports.authLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1000000000,
});

exports.chatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1000000000,
});