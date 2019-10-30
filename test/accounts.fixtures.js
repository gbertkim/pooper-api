function makeAccountsArray() {
    return [
        {
            "id": 1,
            "user_identifier":"u5kz5iofaz", 
            "user_name": "gilbear", 
            "user_pass": "newPassword123", 
            "modified": new Date().toJSON()
        },
        {
            "id": 2,
            "user_identifier":"se8f1cqw5e", 
            "user_name": "gigi", 
            "user_pass": "newPassword123", 
            "modified": new Date().toJSON()
        }
    ];
}

module.exports = {
    makeAccountsArray,
}