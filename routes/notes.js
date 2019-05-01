  const MongoClient = require('mongodb').MongoClient;
  const express = require('express');
  const ObjectId = require('mongodb').ObjectId;
  const fs = require('fs');
  const jwt = require('jsonwebtoken');
  const config = require('../config.json');

  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const JWT_KEY = process.env.JWT_KEY || 'JWT_SECRET_VAL';
  const dbName = 'notes';

  var app = express.Router();


  // OK
  // Gets all the notes added in the base
  app.get('/', function(req, res){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        console.log("Connected to database")
        const token = req.get('x-access-token');

        await jwt.verify(token, JWT_KEY, async function(err, decoded){
          if(err){
            res.status(401).send({
              error: "Utilisateur non connecté"
            })
          } else {
            const db = client.db(dbName);
            const col = await db.collection('notes').find().sort({createdAt: -1}).toArray();

            client.close();
            res.send({
              error: null,
              note: col
            });
          }
        });
      }).catch(function(error){
          console.log("Error server " + error.stack);
          res.send({
            error: error.stack,
            notes: []
          });
      });
  })


  // Inserts a note in the db
  // OK
  app.put('/',  async function(req, res){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
        const token = req.get('x-access-token');

        await jwt.verify(token, JWT_KEY, async function(err, decoded){
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


  // Updates a note from db with it'ss id given in url params
  // OK
  // TODO: check if user is connected or send 401
  app.patch('/:id', async function(req, res){
    var client = new MongoClient(url);

    client.connect()
      .then(async (response) => {
        const token = req.get('x-access-token');

        await jwt.verify(token, JWT_KEY, async function(err, decoded){
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
                        note: updatedNote[0]
                      });
                  }
                }).catch(error =>{
                  res.send({
                    error: err.stack,
                    notes: null
                  });
                });
            }
        });
      }).catch((err) => {
          res.send({
            error: err.stack,
            notes: null
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

        await jwt.verify(token, JWT_KEY, async function(err, decoded){
          if(err){
            res.status(401).send({
              error: "Utilisateur non connecté"
            })
          } else{
            const db = client.db(dbName);
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
                    }
                  }).catch(err => {
                    res.status(500).send({
                      error: "Server error: " + err
                    });
                  });
          }
        });
      }).catch(function(error){
          console.log("Error server " + error.stack)
          res.status(500).send({
            error: error
          });
      });
  })

  // Returns the date of today
  // OK
  function getTodayDate(){
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var hour = today.getHours();
      var min = today.getMinutes();
      var sec = today.getSeconds();

      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      var todayString = dd + '/' + mm + '/' + yyyy + ' ' + hour + ':' + min + ':' + sec;
      return todayString;
  }

  // OK
  // Checks if user can update the note with 'noteId'
  // Also checks if a note exists in db with id == 'noteId'
  async function checkBeforeUpdate(res, currentNote ,decoded){
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
