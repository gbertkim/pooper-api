const path = require('path')
const express = require('express')
// const xss = require('xss')
const AccountsService = require('./accounts-service')

const accountsRouter = express.Router()
const jsonParser = express.json()

const serializeAccounts = account => ({
  id: account.id,
  user_identifier: account.user_identifier,
  user_name: account.user_name,
  user_pass: account.user_pass,
  modified: account.modified
})

const userIdentifier = account => ({
    user_identifier: account.user_identifier,
    user_name: account.user_name,
    modified: account.modified
})

accountsRouter
  .route('/check')
  .post(jsonParser, (req, res, next) => {
    const {user_name, user_pass} = req.body
    const checkAccount = {user_name, user_pass}
    const knexInstance = req.app.get('db')
    for (const [key, value] of Object.entries(checkAccount))
    if (value == null)
        return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
        })
    AccountsService.getUsernames(knexInstance, checkAccount.user_name, checkAccount.user_pass)
      .then(account => {
          if (account === undefined){
            res.status(400).json({
            error: { message: `Username and password do not match`}                
          })
          } else {
          res
            .status(201)
            .json(userIdentifier(account))
          }
      })
      .catch(next)
  })

accountsRouter
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const { user_identifier, user_name, user_pass } = req.body
    const newAccount = { user_identifier, user_name, user_pass }
    console.log(newAccount.user_name)
    for (const [key, value] of Object.entries(newAccount))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        }) 
    
    AccountsService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })
      return AccountsService.insertAccounts(
        req.app.get('db'),
        newAccount
      )
      .then(account => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${account.id}`))
          .json(serializeAccounts(account))
      })
      .catch(next)
    })
  })
  .delete(jsonParser, (req, res, next) => {
    const {user_identifier} = req.body
    console.log(user_identifier)
    AccountsService.deleteAccount(
      req.app.get('db'),
      user_identifier
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = accountsRouter
