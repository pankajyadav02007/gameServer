import dotenv from 'dotenv'
dotenv.config()

import Redis from "ioredis";

const redis = new Redis({
    maxRetriesPerRequest:null,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: "default",
    password: process.env.REDIS_PASSWORD
});

export default redis;