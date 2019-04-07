  const MongoClient = require('mongodb').MongoClient;
  const express = require('express');
  const ObjectId = require('mongodb').ObjectId;
  const fs = require('fs');
  const jwt = require('jsonwebtoken');
  const config = require('../config.json');

  const url = 'mongodb://localhost:27017'
  const dbName = 'notesDb';

  var autoIncUserId = 0;
  var connectedUserId = 1;
  var port = 3000;
  var app = express.Router();


  // Prints Hello World :)
  // OK
  app.get("/hello", (req, res) => {
    res.send("Hello World\n");
  })

  // Inserts a note in the db
  // OK
  app.put('/',  async function(req, res){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        console.log("Connected to database");
        const token = req.get('x-access-token');

        await jwt.verify(token, config.JWT_KEY, async function(err, decoded){
          if(err){
            res.status(401).send({
              error: "Utilisateur non connecté"
            })
          } else {
              const db = client.db(dbName);
              const user_message = {
                userId: decoded.userid,
                content: req.body.content,
                createdAt: getTodayDate(),
                lastUpdatedAt: null,
              }

              const r = await db.collection('notes').insertOne(user_message);
              console.log('New note successfully added !!\n');
              const col = await db.collection('notes').find().toArray();

              client.close();
              res.send({
                  error: null,
                  note: user_message
                }
              );
          }
        });
      }).catch(function(error){
          console.log("Error server " + error.stack)
          res.send({
            error: error.message,
            notes: []
          });
      });
  });

  // OK
  // Gets all the notes added in the base
  app.get('/', function(req, res){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        console.log("Connected to database")
        const token = req.get('x-access-token');

        await jwt.verify(token, config.JWT_KEY, async function(err, decoded){
          if(err){
            res.status(401).send({
              error: "Utilisateur non connecté"
            })
          } else {
            const db = client.db(dbName);
            const col = await db.collection('notes').find().sort({createdAt: -1}).toArray();
            const notes = {
              note: col,
              error: null
            };

            client.close();
            res.send({
              notes
            });
          }
        });
      }).catch(function(error){
          console.log("Error server " + error.stack);
          res.send({
            notes: [],
            error: error.stack
          });
      });
  })

  // Updates a note from db with it'ss id given in url params
  // OK
  // TODO: check if user is connected or send 401
  app.patch('/:id', async function(req, res){
    var client = new MongoClient(url);

    client.connect()
      .then(async (response) => {
        console.log("successfully connected to database !!");
        const token = req.get('x-access-token');

        await jwt.verify(token, config.JWT_KEY, async function(err, decoded){
            if(err){
              res.status(401).send({
                error: "Utilisateur non connecté"
              });
            } else {
                const db = client.db(dbName);
                const noteId = req.params.id.split('id=')[1];

                const currentNote = await db.collection('notes').find({ _id: ObjectId(noteId) }).toArray();
                checkBeforeUpdate(res, currentNote, decoded)
                .then(async (result) => {
                  if(result == true){
                      await db.collection('notes').update(
                        { _id: ObjectId(noteId) },
                        {
                          $set: {
                            content: req.body.content,
                            lastUpdatedAt: getTodayDate()
                          }
                        });
                      const updatedNote = await db.collection('notes').find({ _id: ObjectId(noteId) }).toArray();

                      res.status(200).send({
                        error: null,
                        note: updatedNote
                      });
                  }
                }).catch(error =>{
                  console.log(error);
                });
            }
        });
      }).catch((err) => {
          res.send({
            notes: [],
            error: err.stack
          });
      })

      client.close();
  })

  // OK
  // Deletes a note from db with it's id given in url params
  app.delete('/:id', async function(req, res){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        const token = req.get('x-access-token');

        await jwt.verify(token, config.JWT_KEY, async function(err, decoded){
          if(err){
            res.status(401).send({
              error: "Utilisateur non connecté"
            })
          } else{
            const db = client.db(dbName);
            console.log("Connected to database");
            const noteId = req.params.id.split('id=')[1];

            const noteToDelete = await db.collection('notes').find({ _id: ObjectId(noteId) }).toArray();
            await checkBeforeDelete(res, noteToDelete, decoded)
                  .then(async (result) => {
                    if(result == true){
                        await db.collection('notes').deleteOne(noteToDelete[0]);
                        const allNotes = await db.collection('notes').find().toArray();

                        res.status(200).send({
                          error: null,
                          notes: allNotes
                        });
                        client.close();
                        console.log("Note successfully deleted !!!")
                    }
                  }).catch(err => {
                    res.status(500).send({
                      error: "Server error: " + err
                    })
                  });
          }
        });
      }).catch(function(error){
          console.log("Error server " + error.stack)
          res.status(500).send({error: error})
      });
  })

  // Delete the last notes added
  // OK
  /*app.delete('/deleteLast', function(req, res){
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
          res.status(500).send({error: error})
      });

      client.close();
  });*/


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
      return today;
  }

  // OK
  // Checks if user can update the note with 'noteId'
  // Also checks if a note exists in db with id == 'noteId'
  async function checkBeforeUpdate(res, noteToDelete ,decoded){
      if(currentNote.length > 0){
          if(currentNote[0].userId != decoded.userid){
            res.status(403).send({
              error: "Accès non autorisé à cette note",
              note: {}
            });
            return false;
          }
      }
      if(currentNote.length == 0){
        res.status(404).send({
          error: "Cet identifiant est inconnu",
          note: {}
        });
        return false;
      }
      return true;
  }

  // OK
  // Checks if user can delete the note with 'noteId'
  // Also checks if a note exists in db with id == 'noteId'
  async function checkBeforeDelete(res, noteToDelete, decoded){
      if(noteToDelete.length == 0){
        res.status(404).send({
          error: "Cet identifiant est inconnu",
          note: {}
        });
        return false;
      }
      if(noteToDelete.length > 0 && noteToDelete[0].userId != decoded.userid){
        res.status(403).send({
          error: "Accès non autorisé à cette note",
          note: {}
        });
        return false;
      }
      return true;
  }
module.exports = app;
