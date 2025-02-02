const express = require('express');
const userService = require('./user.service');
const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const md5 = require('md5');
const fs = require('fs');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const JWT_KEY = process.env.JWT_KEY || 'JWT_SECRET_VAL';
const dbName = 'notes';

var format = /[!@#$%^&*(),.?":{}|<>]/g;
var maj = /[A-Z]/g;


  // routes
  router.use(express.json());

  // OK
  // Deletes all the users from db
  router.delete('/deleteAll', async function(req, res, next){
      var client = new MongoClient(url);

      client.connect()
      .then(async function(response){
          await client.connect();
          const db = client.db(dbName);

          var all_messages = await db.collection('users').find().toArray();
          for(i = 0 ; i < all_messages.length ; i++){
            await db.collection('users').deleteOne(all_messages[i]);
          }

          res.send(all_messages)
      }).catch(function(error){
          console.log("Error server " + error.stack)
      });

      client.close();
  });

  //OK
  // Get all users in the db
  router.get('/getAll', function getAllUsers(req, res, next){
        var client = new MongoClient(url);

        client.connect()
        .then(async function(response){
          const db = client.db(dbName);
          const allUsers = await db.collection('users').find().toArray();

          console.log("Getting all users from db: " + allUsers);

          res.send({
            users: allUsers
          })

          client.close();
        }).catch(function(error){
          client.close();
          ser.send({
            error: error,
            message: 'Server error'
          })
        });
  });

  // OK
  // Check error case when signing up a new user or when user trying de sign in
  async function CheckingParams(userName, password, res){
      if(password.length < 4){
        res.status(400).send({
          error: 'Le mot de passe doit contenir au moins 4 caractères'
        });
      }
      if(format.test(userName) || (maj.test(userName))){
        res.status(400).send({

          error: 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées'
        });
      }
      if(userName.length < 2 || userName.length > 20){
        res.status(400).send({
          error: 'Votre identifiant doit contenir entre 2 et 20 caractères'
        });
      }
  }


  module.exports = router;
