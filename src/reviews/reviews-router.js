const path = require('path')
const express = require('express')
// const xss = require('xss')
const ReviewsService = require('./reviews-service')

const reviewsRouter = express.Router()
const jsonParser = express.json()

const serializeReview = review => ({
  id: review.id,
  bathroom_id: review.bathroom_id,
  review_user_id: review.review_user_id,
  review_user_name: review.review_user_name,
  modified: review.modified,
  sex: review.sex,
  clean: review.clean,
  privacy: review.privacy,
  smell: review.smell,
  comment: review.comment,
  direction: review.direction,
  overall_score: review.overall_score
})

reviewsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ReviewsService.getAllReviews(knexInstance)
      .then(reviews => {
        res.json(reviews.map(serializeReview))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { id, bathroom_id, review_user_id, review_user_name, sex, clean, privacy, smell, comment, direction, overall_score  } = req.body
    const newReview = { id, bathroom_id, review_user_id, review_user_name, sex, clean, privacy, smell, comment, direction, overall_score }

    for (const [key, value] of Object.entries(newReview))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    
    ReviewsService.insertReview(
      req.app.get('db'),
      newReview
    )
      .then(review => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${review.id}`))
          .json(serializeReview(review))
      })
      .catch(next)
  })

reviewsRouter
  .route('/:review_id')
  .all((req, res, next) => {
    ReviewsService.getById(
      req.app.get('db'),
      req.params.review_id
    )
      .then(review => {
        if (!review) {
          return res.status(404).json({
            error: { message: `Review doesn't exist` }
          })
        }
        res.review = review
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeReview(res.review))
  })
  .delete((req, res, next) => {
    ReviewsService.deleteReview(
      req.app.get('db'),
      req.params.review_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { id, bathroom_id, review_user_id, review_user_name, sex, clean, privacy, smell, comment, direction, overall_score  } = req.body
    const reviewToUpdate = { id, bathroom_id, review_user_id, review_user_name, sex, clean, privacy, smell, comment, direction, overall_score }

    for (const [key, value] of Object.entries(reviewToUpdate))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    ReviewsService.updateReviews(
      req.app.get('db'),
      req.params.review_id,
      reviewToUpdate
    )
      .then(review => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = reviewsRouter
