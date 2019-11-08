const knex = require('knex')
const { expect } = require('chai')
const app = require('../src/app')
const { makeAccountsArray } = require ('./accounts.fixtures')

describe(`Accounts service endpoints`, () => {
    let db
    let testAccounts = makeAccountsArray()
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('accounts').delete())

    describe(`POST /check`, () => {
        beforeEach(() => {
            return db
                .into('accounts')
                .insert(testAccounts)
        })
        afterEach(() => db('accounts').delete())

        it(`should check for an account responding with 201 and the user_name and user_identifier`,  () => {
            const checkAccount = {
                "user_name": "gilbear", 
                "user_pass": "newPassword123", 
            }
            return supertest(app)
                .post('/api/accounts/check')
                .send(checkAccount)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_name).to.eql(checkAccount.user_name)
                    expect(res.body.user_identifier).to.eql('u5kz5iofaz')
                })
        })
        it(`should let user know the account/password combination is not found`,  () => {
            const checkAccount = {
                "user_name": "bogus", 
                "user_pass": "11111", 
            }
            return supertest(app)
                .post('/api/accounts/check')
                .send(checkAccount)
                .expect(400, { error: { message: 'Username and password do not match' } })

        })

        const requiredFields = ['user_name', 'user_pass']
        requiredFields.forEach(field => {
            const checkAccount = {
                "user_name": "gilbear", 
                "user_pass": "newPassword123", 
            }
            it(`should respond with 400 and an error message when the '${field}' is missing`, () => {
                delete checkAccount[field]
                return supertest(app)
                    .post('/api/accounts/check')
                    .send(checkAccount)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
    describe(`POST /accounts`, () => {
        beforeEach(() => {
            return db
                .into('accounts')
                .insert(testAccounts)
        })
        afterEach(() => db('accounts').delete())
        it(`should create an account, responding with 201 and the new account`,  () => {
            // this.retries(3)
            const newAccount = {
                    "user_identifier":"awefw0a9jw9", 
                    "user_name": "testName", 
                    "user_pass": "testPassword123"
            }
            return supertest(app)
                .post('/api/accounts')
                .send(newAccount)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_identifier).to.eql(newAccount.user_identifier)
                    expect(res.body.user_name).to.eql(newAccount.user_name)
                    expect(res.body.user_pass).to.eql(newAccount.user_pass)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/accounts/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                })
        })
        it(`should respond with 400 and an error message that username already exists`, () => {
            const newAccount = {
                "id": 3,
                "user_identifier":"awefw0a9jw9", 
                "user_name": "gilbear", 
                "user_pass": "testPassword123"
            }
            return supertest(app)
                .post('/api/accounts')
                .send(newAccount)
                .expect(400)
        })
        const requiredFields = ['user_identifier', 'user_name', 'user_pass']
        requiredFields.forEach(field => {
            const newAccount = {
                "id": 3,
                "user_identifier":"awefw0a9jw9", 
                "user_name": "testName", 
                "user_pass": "testPassword123"
        }
            it(`should respond with 400 and an error message when the '${field}' is missing`, () => {
                delete newAccount[field]
                return supertest(app)
                    .post('/api/accounts')
                    .send(newAccount)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
})