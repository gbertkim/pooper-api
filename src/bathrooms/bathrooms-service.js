const BathroomsService = {
  getAllBathrooms(knex) {
    return knex.select('*').from('bathrooms')
  },

  insertBathroom(knex, newBathroom) {
    return knex
      .insert(newBathroom)
      .into('bathrooms')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex.from('bathrooms').select('*').where('id', id).first()
  },

  deleteBathroom(knex, id) {
    return knex('bathrooms')
      .where({ id })
      .delete()
  },

  updateBathrooms(knex, id, newBathroomFields) {
    return knex('bathrooms')
      .where({ id })
      .update(newBathroomFields)
    },
}

module.exports = BathroomsService
