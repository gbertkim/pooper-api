const bcrypt = require('bcryptjs')

const AccountsService = {
    // getAllAccounts(knex) {
    //   return knex.select('*').from('accounts')
    // },
    hasUserWithUserName(db, user_name) {
      return db('accounts')
        .where({ user_name })
        .first()
        .then(user => !!user)
    },
    getUsernames(knex, username, password) {
        return knex.from('accounts')
        .select('user_identifier', 'user_name', 'modified')
        .where('user_name', username)
        .andWhere('user_pass', password)
        .first()
    },
    insertAccounts(knex, newAccounts) {
      return knex
        .insert(newAccounts)
        .into('accounts')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteAccount(knex, user_id) {
      return knex.from('accounts')
        .where('user_identifier', user_id)
        .delete()
    },
    getById(knex, id) {
      return knex.from('accounts').select('*').where('id', id).first()
    },
    // deleteAccounts(knex, id) {
    //   return knex('accounts')
    //     .where({ id })
    //     .delete()
    // },
        // hashPassword(password) {
    //   return bcrypt.hash(password, 12)
    // },
  }
  module.exports = AccountsService
  