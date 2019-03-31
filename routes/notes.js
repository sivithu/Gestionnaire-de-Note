  const MongoClient = require('mongodb').MongoClient;
  const url = 'mongodb://localhost/notes'
  const dbName = 'notes';
  const express = require('express');
  var ObjectId = require('mongodb').ObjectId;

  var autoIncUserId = 0;
  var connectedUserId = 1;
  var port = 3000;
  var app = express.Router();

  app.use(express.json());

  // Prints Hello World :)
  // OK
  app.get("/hello", (req, res) => {
    res.send("Hello World\n");
  })

  // Inserts a note in the db
  // OK
  app.put('/',  async function(req, res){
      // TODO: Check if JWT still alive
      //       Dynamic userId

      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        console.log("Connected to database")
        const db = client.db(dbName);

        const user_message = {
          userId: autoIncUserId,
          content: req.body.content,
          createdAt: getTodayDate(),
          lastUpdatedAt: null,
        }
        // Insert a single document
        let r = await db.collection('notes').insertOne(user_message);
        autoIncUserId += 1;
        console.log('New note successfully added !!\n');
        const col = await db.collection('notes').find().toArray();

        res.send({
            error: null,
            note: user_message
          }
        );
      }).catch(function(error){
        if (err.name === 'UnauthorizedError') {
          res.send(401, 'Utilisateur non connecté');
        }else{
          console.log("Error server " + error.stack)
          res.send({
            error: error.message,
            notes: []
          })
        }
      });

      client.close();
  });

  // Gets all the notes added in the base
  // OK
  // TODO: check if user is connected or send 401
  app.get('/', function(req, res){

      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        console.log("Connected to database")
        const db = client.db(dbName);
        const col = await db.collection('notes').find().sort({createdAt: -1}).toArray();
        const notes = {
          note: col,
          error: null
        };
        res.send({
          notes
        });
        console.log("\nAll notes: \n" + notes);
      }).catch(function(error){
        if (err.name === 'UnauthorizedError') {
          res.send(401, 'Utilisateur non connecté');
        }else{
          res.send({
            notes: [],
            error: error.stack
          });
          console.log("Error server " + error.stack);
        }
      });

      client.close();
  })

  // Updates a note from db with it'ss id given in url params
  // OK
  // TODO: check if user is connected or send 401
  app.patch('/:id', async function(req, res){

    var client = new MongoClient(url);

    client.connect()
      .then(async (response) => {
        console.log("successfully connected to database !!");

        const db = client.db(dbName);
        const noteId = req.params.id.split('id=')[1];

        const currentNote = await db.collection('notes').find({ _id: ObjectId(noteId) }).toArray();

        if(currentNote[0] != undefined || currentNote[0] != null){
            if(currentNote[0].userId != connectedUserId){
              res.status(403).send({
                error: "Accès non autorisé à cette note",
                noteId: {}
              });
            } else{
              const updatedNote = await db.collection('notes').find({ _id: ObjectId(noteId) }).toArray();

              res.send({
                error: null,
                note: updatedNote
              })
            }
            // TODO: Check if user is connected
        }else{
          res.status(404).send({
            error: "Cet identifiant est inconnu",
            note: {}
          });
        }

        await db.collection('notes').update(
          { _id: ObjectId(noteId) },
          {
            $set: {
              content: req.body.content,
              lastUpdatedAt: getTodayDate()
            }
          }
        );
      }).catch((err) => {
        console.log("Error server " + err.stack);
          res.send({
            notes: [],
            error: err.stack
          });
      })

      client.close();
  })

  app.delete('/:id', async function(req, res){
    console.log("Note successfully deleted !!!")
  })

  // Delete the last notes added
  // OK
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


  // Returns the date of today
  // OK
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
