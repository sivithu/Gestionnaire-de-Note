const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = 'test';
const express = require('express');

var port = process.env.PORT || 3000;
var app = express.Router();

app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("Hello World\n");
})

app.put('/', async (req, res) => {
    const client = new MongoClient(url);
    const message = req.body.msg;

    console.log("Message: \n" + message + "\n");

    (async function(){
        try{
          await client.connect();
          console.log("Connected to database");

          const db = client.db(dbName);

          // Insert a single document
          let r = await db.collection('messages').insertOne(user_message);
          const col = await db.collection('messages').find().toArray();
          console.log(col);

        } catch(err){
          console.log(err.stack);
        }
    })();

  res.send('New note successfully added !!\n');
});


app.delete('/:id', (res, req) => {
  res.send('Note successfully deleted !!\n');
});


module.exports = app;
