
import { Worker } from "bullmq"
import redis from "../redis.mjs"
import sendEmail from "../email.mjs"

const emailJob =  async (job) => {
        const {to, subject,body} = job.data
        await sendEmail(to, subject, body)
    }

const worker = new Worker('email_queue',
   emailJob,
   { connection: redis }
)

worker.on("completed",(job) => {
    console.log(`job done!!! ${job.id}`)
})


worker.on("failed",(job) => {
    console.log(`job failed!!! ${job.id} err: ${err}`)
})

// worker.start()