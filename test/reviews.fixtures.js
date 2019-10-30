function makeReviewsArray() {
    return [
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
            "overall_score":"1"
        },
        {
            "id":2,
            'bathroom_id':2,
            "review_user_id": "u5kz5iofaz",
            "review_user_name":"gilbear",
            "modified":"2019-09-05T05:01:19.430Z",
            "sex":"Women",
            "clean":3,
            "privacy":3,
            "smell":3,
            "comment":"Alright Bathroom",
            "direction":"Front of store",
            "overall_score":"3"
        }
    ];
}

module.exports = {
    makeReviewsArray,
}