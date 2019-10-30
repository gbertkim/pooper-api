const knex = require('knex')
const { expect } = require('chai')
const app = require('../src/app')
const { makeAccountsArray} = require ('./accounts.fixtures')
const { makeBathroomsArray} = require ('./bathrooms.fixtures')
const { makeReviewsArray } = require ('./reviews.fixtures')

describe(`Reviews service endpoints`, () => {
    let db
    let testAccounts = makeAccountsArray()
    let testBathrooms = makeBathroomsArray()
    let testReviews = makeReviewsArray()


    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after(() => db.destroy())

    before(() => db('reviews').truncate())
    before(() => db('bathrooms').delete())
    before(() => db('accounts').delete())
    afterEach(() => db('reviews').truncate())
    afterEach(() => db('bathrooms').delete())
    afterEach(() => db('accounts').delete())

    describe(`GET /reviews`, () => {
        context(`Given no reviews`, () => {
            it(`should respond with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/reviews')
                    .expect(200, [])
            })
        }) 
        context(`GET '/api/reviews' has data`, () => {
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
            beforeEach(() => {
                return db
                    .into('reviews')
                    .insert(testReviews)
            })
            it(`should respond with 200 and all of the reviews`, () => {
                return supertest(app)
                    .get('/api/reviews')
                    .expect(200, testReviews)
            })
        })
    })

    describe(`GET /reviews/:review_id`, () => {
        context(`Given no reviews`, () => {
            it(`responds with 404`, () => {
                const reviewId = 123456
                return supertest(app)
                    .get(`/api/reviews/${reviewId}`)
                    .expect(404, { error: { message: `Review doesn't exist` } })
            })
        })
        context('Given there are reviews in the database', () => {
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
            beforeEach(() => {
                return db
                    .into('reviews')
                    .insert(testReviews)
            })
            it('should respond with 200 and the specified review', () => {
                const reviewId = 2
                const expectedReview = testReviews[reviewId - 1]
                return supertest(app)
                    .get(`/api/reviews/${reviewId}`)
                    .expect(200, expectedReview)
            })
        })
    })

    describe(`POST /reviews`, () => {
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
        it(`should create a review, responding with 201 and the new review`,  () => {
            // this.retries(3)
            const newReview = {
                "id":3,
                'bathroom_id':1,
                "review_user_id": "u5kz5iofaz",
                "review_user_name":"gilbear",
                "sex":"Women",
                "clean":2,
                "privacy":2,
                "smell":2,
                "comment":"Very dirty!!!!",
                "direction":"around the back of the restaurant",
                "overall_score":"2"
            }
            return supertest(app)
                .post('/api/reviews')
                .send(newReview)
                .expect(201)
                .expect(res => {
                    expect(res.body.id).to.eql(newReview.id)
                    expect(res.body.bathroom_id).to.eql(newReview.bathroom_id)
                    expect(res.body.review_user_id).to.eql(newReview.review_user_id)
                    expect(res.body.review_user_name).to.eql(newReview.review_user_name)
                    expect(res.body.sex).to.eql(newReview.sex)
                    expect(res.body.clean).to.eql(newReview.clean)
                    expect(res.body.privacy).to.eql(newReview.privacy)
                    expect(res.body.smell).to.eql(newReview.smell)
                    expect(res.body.comment).to.eql(newReview.comment)
                    expect(res.body.direction).to.eql(newReview.direction)
                    expect(res.body.overall_score).to.eql(newReview.overall_score)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/reviews/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })
        const requiredFields = ['id', 'bathroom_id', 'review_user_id', 'review_user_name', 'sex', 'clean', 'privacy', 'smell', 'comment', 'direction', 'overall_score']
        requiredFields.forEach(field => {
            const newReview = {
                "id":3,
                'bathroom_id':1,
                "review_user_id": "u5kz5iofaz",
                "review_user_name":"gilbear",
                "sex":"Women",
                "clean":2,
                "privacy":2,
                "smell":2,
                "comment":"Very dirty!!!!",
                "direction":"around the back of the restaurant",
                "overall_score":"2"
            }
            it(`should respond with 400 and an error message when the '${field}' is missing`, () => {
                delete newReview[field]
                return supertest(app)
                    .post('/api/reviews')
                    .send(newReview)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
})