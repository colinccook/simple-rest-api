const express = require('express');
const app = express();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const guid = require('guid');
const bodyParser = require('body-parser');
const fs = require('fs');

// ensure express parses body (and this has to be done before the routes below)
app.use(bodyParser.json());

// secret key stuff (so that we can configure a mongodb connection)
function getMongoConnectionString() {

    if (process.env.mongoconnection)
        return process.env.mongoconnection.trim();

    return fs.readFileSync('mongoconnection', 'utf8').trim();
}

// mongo db stuff
var db;

mongoClient.connect(getMongoConnectionString(), (err, database) => {
    if (err) return console.log(err);

    db = database;

    app.listen(3000, () => {
        console.log('listening on port 3000')
    });
});

// ********
// ROUTES!!
// ********

// nice hello world API call for testing/demo purposes
app.all('/hello', (req, res) => {
    res.send('Hello world!');
});

// if any request is made to root, list avilable routes
app.all('/', (req, res) => {
    var cursor = db.listCollections().toArray((err, results) => {
        if (err) return res.status(500).json(err);
        return res.json(results.map((c) => c.name));
    });
});

// http post (create)
app.post('/*', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object with something in it");

    db.collection(req.path).save(req.body, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    })
});

// http get (read)
app.get('/*', (req, res) => {
    var cursor = db.collection(req.path).find().toArray((err, results) => {
        if (err) return res.status(500).json(err);
        return res.json(results);
    });
});

// http put (update/replace)
app.put('/*', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object with something in it");

    db.collection(req.path).update(req.body, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    })
});

// http delete
app.delete('/*', (req, res) => {
    if (!req.body) return res.status(400).json("You must provide a body in a post");
    if (!Object.keys(req.body).length) return res.status(400).json("You must provide a JSON object");
    if (!req.body._id) return res.status(400).json('You must provide an \'_id\' property to delete');

    db.collection(req.path).deleteOne({_id: new mongodb.ObjectID(req.body._id)}, (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json(result);
    });
})