const knex = require('knex')
const { expect } = require('chai')
const app = require('../src/app')
const { makeBathroomsArray } = require ('./bathrooms.fixtures')

describe(`Bathrooms service endpoints`, () => {
    let db
    let testAccounts = [
        {
            "id": 1,
            "user_identifier":"u5kz5iofaz", 
            "user_name": "gilbear", 
            "user_pass": "newPassword123", 
            "modified": "2019-09-03 21:56:01"
        },
        {
            "id": 2,
            "user_identifier":"se8f1cqw5e", 
            "user_name": "gigi", 
            "user_pass": "newPassword123", 
            "modified": "2019-09-06 21:56:01"
        }
    ]
    let testBathrooms = makeBathroomsArray()
    let testReviews = [
        {
            "id":1,
            'bathroom_id':1,
            "review_user_id": "u5kz5iofaz",
            "review_user_name":"gilbear",
            "modified":"2019-09-04T05:01:19.430Z",
            "sex":"Men",
            "clean":1,
            "privacy":1,
            "smell":1,
            "comment":"Very dirty!",
            "direction":"around the back of the restaurant",
            "overall_score":1
        }
    ]
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('bathrooms').delete())
    before(() => db('accounts').delete())
    afterEach(() => db('bathrooms').delete())
    afterEach(() => db('accounts').delete())

    describe(`GET /bathrooms`, () => {
        context(`Given no bathrooms`, () => {
            it(`should respond with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/bathrooms')
                    .expect(200, [])
            })
        }) 
        context(`GET '/api/bathrooms' has data`, () => {
            beforeEach(() => {
                return db
                    .into('accounts')
                    .insert(testAccounts)
            })
            beforeEach(() => {
                return db
                    .into('bathrooms')
                    .insert(testBathrooms)
            })
            it(`should respond with 200 and all of the bathrooms`, () => {
                return supertest(app)
                    .get('/api/bathrooms')
                    .expect(200, testBathrooms)
            })
        })
    })

    describe(`GET /bathrooms/:bathroom`, () => {
        context(`Given no bathrooms`, () => {
            it(`responds with 404`, () => {
                const bathroomId = 123456
                return supertest(app)
                    .get(`/api/bathrooms/${bathroomId}`)
                    .expect(404, { error: { message: `Bathroom doesn't exist` } })
            })
        })
        context('Given there are bathrooms in the database', () => {
            beforeEach(() => {
                return db
                    .into('accounts')
                    .insert(testAccounts)
            })
            beforeEach(() => {
                return db
                    .into('bathrooms')
                    .insert(testBathrooms)
            })
            it('should respond with 200 and the specified bathroom', () => {
                const bathroomId = 2
                const expectedBathroom = testBathrooms[bathroomId - 1]
                return supertest(app)
                    .get(`/api/bathrooms/${bathroomId}`)
                    .expect(200, expectedBathroom)
            })
        })
    })

    describe(`POST /bathrooms`, () => {
        beforeEach(() => {
            return db
                .into('accounts')
                .insert(testAccounts)
        })
        it(`should create a bathroom, responding with 201 and the new bathroom`,  () => {
            // this.retries(3)
            const newBathroom = {
                "id":3,
                "name": "test bathroom",
                "bathroom_user_id":"u5kz5iofaz",
                "bathroom_user_name":"gilbear",
                "longitude":"-115",
                "latitude":"32",
                "handi":false,
                "men":false,
                "women":false,
                "unisex":true,
                "family":false,
            }
            return supertest(app)
                .post('/api/bathrooms')
                .send(newBathroom)
                .expect(201)
                .expect(res => {
                    expect(res.body.id).to.eql(newBathroom.id)
                    expect(res.body.name).to.eql(newBathroom.name)
                    expect(res.body.bathroom_user_id).to.eql(newBathroom.bathroom_user_id)
                    expect(res.body.bahthroom_user_name).to.eql(newBathroom.bahthroom_user_name)
                    expect(res.body.longitude).to.eql(newBathroom.longitude)
                    expect(res.body.latitude).to.eql(newBathroom.latitude)
                    expect(res.body.handi).to.eql(newBathroom.handi)
                    expect(res.body.men).to.eql(newBathroom.men)
                    expect(res.body.women).to.eql(newBathroom.women)
                    expect(res.body.unisex).to.eql(newBathroom.unisex)
                    expect(res.body.family).to.eql(newBathroom.family)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bathrooms/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/bathrooms/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })

        const requiredFields = ['id', 'name', 'bathroom_user_id', 'bathroom_user_name', 'longitude', 'latitude', 'handi', 'men', 'women', 'unisex', 'family']
        requiredFields.forEach(field => {
            const newBathroom = {
                "id":3,
                "name": "test bathroom",
                "bathroom_user_id":"u5kz5iofaz",
                "bathroom_user_name":"gilbear",
                "longitude":"-115",
                "latitude":"32",
                "handi":false,
                "men":false,
                "women":false,
                "unisex":true,
                "family":false,
            }
            it(`should respond with 400 and an error message when the '${field}' is missing`, () => {
                delete newBathroom[field]
                return supertest(app)
                    .post('/api/bathrooms')
                    .send(newBathroom)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
})