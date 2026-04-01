const express = require('express')
const { createCodeRouter } = require('./code')
const { createCompileRouter } = require('./compile')
const { createUploadRouter } = require('./upload')
const { createPortsRouter } = require('./ports')
const { createSerialRouter } = require('./serial')

function createRoutes(config) {
  const router = express.Router()
  router.post('/code', createCodeRouter(config))
  router.post('/compile', createCompileRouter(config))
  router.post('/upload', createUploadRouter(config))
  router.get('/ports', createPortsRouter(config))
  router.use('/serial', createSerialRouter())
  return router
}

module.exports = { createRoutes }
