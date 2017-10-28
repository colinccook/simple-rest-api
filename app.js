const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;

// mongo db stuff
var db;

mongoClient.connect('mongodb://simple-rest-api-user:323e2428-1447-4681-bdc2-5eee4b5a9d99@ds237475.mlab.com:37475/simple-rest-api', (err, database) => {
    if (err) return console.log(err);

    db = database;

    app.listen(3000, () => {
        console.log('listening on port 3000')
    });
});


app.get('/hello', (req, res) => {
    res.send('Hello world!')
});

// http post (create)
app.post('/', (req, res) => {

    if (req.body.id) { 
        return res.status(404).json('You cannot post an ID; the API will provide one for you');
    }

    db.collection('root').save(req.body, (err, result) => {
        if (err) return res.status(500).json(err);
    })

    console.log('saved to database');
});