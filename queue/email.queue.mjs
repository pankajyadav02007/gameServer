import { Queue } from 'bullmq'
import redis from '../redis.mjs'

const emailQueue = new Queue ("email_queue",{connection: redis})

export default emailQueue;