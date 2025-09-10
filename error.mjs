const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  if (err.isCustom) {
    return res.status(err.statusCode).json({ errorMessage: err.message })
  }
  res.status(500).json({ errorMessage: 'Something broke!' })
}

class ServerError extends Error {
  constructor(code, msg) {
    super(msg)
    this.statusCode = code || 500
    this.isCustom = true
  }
}

export { errorHandler, ServerError }