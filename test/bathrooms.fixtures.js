function makeBathroomsArray() {
    return [
        {
            "id":1,
            "name": "Molca Salsa",
            "bathroom_user_id":"u5kz5iofaz",
            "bathroom_user_name":"gilbear",
            "longitude":"-117.93226909999998",
            "latitude":"33.9177213",
            "handi":false,
            "men":true,
            "women":true,
            "unisex":false,
            "family":false,
            "modified": new Date().toJSON()
        },
        {
            "id":2,
            "name":"Target in Amerige ",
            "bathroom_user_id": "se8f1cqw5e",
            "bathroom_user_name":"gigi",
            "longitude":"-117.96115729999997",
            "latitude":"33.8798667",
            "handi":true,
            "men":true,
            "women":true,
            "unisex":true,
            "family":true,
            "modified": new Date().toJSON()
        }
    ];
}

module.exports = {
    makeBathroomsArray,
}