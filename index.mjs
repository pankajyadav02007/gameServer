// import dotenv from 'dotenv'
// dotenv.config()

import express from 'express'
import { errorHandler } from './error.mjs'
import userRouter from './users/router.mjs'
import gameRouter from './game/router.mjs'
import sessionRouter from './session/router.mjs'
const app = express()

app.use(express.json())

app.use('/users', userRouter)
app.use('/games', gameRouter)
app.use('/sessions', sessionRouter)

app.all(/^.*$/, (req, res) => {
  res.status(400).json({ msg: 'route dosen\'t exists' })
})

app.use(errorHandler)

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err)
  }
  console.log(`Server started on port ${process.env.PORT}`)
})