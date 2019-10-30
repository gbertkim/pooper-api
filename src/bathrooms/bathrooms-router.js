const path = require('path')
const express = require('express')
// const xss = require('xss')
const BathroomsService = require('./bathrooms-service')

const bathroomsRouter = express.Router()
const jsonParser = express.json()

const serializeBathrooms = bathroom => ({
  id: bathroom.id,
  name: bathroom.name,
  bathroom_user_id: bathroom.bathroom_user_id,
  bathroom_user_name: bathroom.bathroom_user_name,
  longitude: bathroom.longitude,
  latitude: bathroom.latitude,
  handi: bathroom.handi,
  men: bathroom.men,
  women: bathroom.women,
  unisex: bathroom.unisex,
  family: bathroom.family,
  modified: bathroom.modified
})

bathroomsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BathroomsService.getAllBathrooms(knexInstance)
      .then(bathrooms => {
        res.json(bathrooms.map(serializeBathrooms))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { id, name, bathroom_user_id, bathroom_user_name, longitude, latitude, handi, men, women, unisex, family } = req.body //modified
    const newBathroom = { id, name, bathroom_user_id, bathroom_user_name, longitude, latitude, handi, men, women, unisex, family } //modified

    for (const [key, value] of Object.entries(newBathroom))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    BathroomsService.insertBathroom(
      req.app.get('db'),
      newBathroom
    )
      .then(bathroom => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bathroom.id}`))
          .json(serializeBathrooms(bathroom))
      })
      .catch(next)
  })

bathroomsRouter
  .route('/:bathroom_id')
  .all((req, res, next) => {
    BathroomsService.getById(
      req.app.get('db'),
      req.params.bathroom_id
    )
      .then(bathroom => {
        if (!bathroom) {
          return res.status(404).json({
            error: { message: `Bathroom doesn't exist` }
          })
        }
        res.bathroom = bathroom
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeBathrooms(res.bathroom))
  })
  .delete((req, res, next) => {
    BathroomsService.deleteBathroom(
      req.app.get('db'),
      req.params.bathroom_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { id, name, bathroom_user_id, bathroom_user_name, longitude, latitude, handi, men, women, unisex, family } = req.body //modified
    const bathroomToUpdate = { id, name, bathroom_user_id, bathroom_user_name, longitude, latitude, handi, men, women, unisex, family } //modified

    for (const [key, value] of Object.entries(bathroomToUpdate))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    BathroomsService.updateBathrooms(
      req.app.get('db'),
      req.params.bathroom_id,
      bathroomToUpdate
    )
      .then(bathroom => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bathroomsRouter
