const {MongoClient} = require("mongodb");
const url = "mongodb://matian:matian@localhost:8604";
let client;

async function getDB() {
    if (!client) {
        client = new MongoClient(url);
        await client.connect();
    }
    return client.db("gugle-docs");
}

module.exports = getDB;
