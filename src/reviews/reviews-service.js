const ReviewsService = {
  getAllReviews(knex) {
    return knex.select('*').from('reviews')
  },

  insertReview(knex, newReview) {
    return knex
      .insert(newReview)
      .into('reviews')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('reviews')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteReview(knex, id) {
    return knex('reviews')
      .where({ id })
      .delete()
  },
  
  updateReviews(knex, id, newReviewFields) {
    return knex('reviews')
      .where({ id })
      .update(newReviewFields)
    },
}

module.exports = ReviewsService
