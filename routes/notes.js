const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost/notes'
const dbName = 'notes';
const express = require('express');

var port = 3000;
var app = express.Router();

app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("Hello World\n");
})

app.put('/',  async function(req, res){

    var client = new MongoClient(url);

    let user_message = {
      userId: 1,
      content: req.body.content,
      createdAt: getTodayDate(),
      lastUpdatedAt: null
    }


    client.connect()
    .then(async function(response){
      console.log("Connected to database")
      const db = client.db(dbName);

      // Insert a single document
      let r = await db.collection('notes').insertOne(user_message);
      res.send('New note successfully added !!\n');
      const col = await db.collection('notes').find().toArray();
      console.log(col);
    }).catch(function(error){
      console.log("Error server " + error.stack)
    });

    client.close();
});


app.get('/all', function(req, res){

    var client = new MongoClient(url);

    client.connect()
    .then(async function(response){
      console.log("Connected to database")
      const db = client.db(dbName);
      const col = await db.collection('notes').find().toArray();
      res.send(JSON.stringify(col));
      console.log("\nAll notes: \n" + (JSON.stringify(col)));
    }).catch(function(error){
      if (err.name === 'UnauthorizedError') {
        res.send(401, 'Utilisateur non connecté');
      }else{
        console.log("Error server " + error.stack)
      }
    });

    client.close();
})

app.patch('/:id', function(req, res){
  console.log("Note successfulu updated !!!");
})

// app.delete('/:id', (req, res) => {
//   res.send('Note successfully deleted !!\n');
// });

app.delete('/deleteLast', function(req, res){
    var client = new MongoClient(url);

    client.connect()
    .then(async function(response){
        await client.connect();
        const db = client.db(dbName);
        console.log("Connected to database");

        var all_messages = await db.collection('notes').find().toArray();
        await db.collection('notes').deleteOne(all_messages[all_messages.length - 1]);
        all_messages = await db.collection('notes').find().toArray();
        console.log("All messages: " + (JSON.stringify(all_messages)) + "\n");
        res.send(all_messages)
    }).catch(function(error){
        console.log("Error server " + error.stack)
    });

    client.close();
});

function getTodayDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    console.log("Today's date = " + today);
    return today;
}


module.exports = app;
