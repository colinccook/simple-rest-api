const express = require('express');
const app = express();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const guid = require('guid');
const bodyParser = require('body-parser');

// ensure express parses body (and this has to be done before the routes below)
app.use(bodyParser.json());

// mongo db stuff
var db;

mongoClient.connect('mongodb://simple-rest-api-user:323e2428-1447-4681-bdc2-5eee4b5a9d99@ds237475.mlab.com:37475/simple-rest-api', (err, database) => {
    if (err) return console.log(err);

    db = database;

    app.listen(3000, () => {
        console.log('listening on port 3000')
    });
});

// ROUTES!!
app.get('/hello', (req, res) => {
    res.send('Hello world!');
});

// http post (create)
app.post('/', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object with something in it");

    db.collection('root').save(req.body, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    })
});

// http get (read)
app.get('/', (req, res) => {
    var cursor = db.collection('root').find().toArray((err, results) => {
        if (err) return res.status(500).json(err);
        return res.json(results);
    });
});

// http put (update/replace)
app.put('/', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object with something in it");

    db.collection('root').update(req.body, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    })
});

// http delete
app.delete('/', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object");
    if (!req.body._id) return res.status(400).json('You must provide an \'_id\' property to delete');

    db.collection('root').deleteOne({_id: new mongodb.ObjectID(req.body._id)}, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
})