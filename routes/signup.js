const express = require('express');
const config = require('../config.json');
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


// OK
// Adds new user in db
router.post('/', async function(req, res, next){
      var client = new MongoClient(url);
      const username = req.body.username;
      const nickname = req.body.nickname;
      const password = req.body.password;

      client.connect()
      .then(async function(response){
          //cCheckingParams(username, password, res);
          const db = client.db(dbName);
          const sameUserNameInDb = await db.collection('users').find( {username: req.body.username} ).toArray();

          if(sameUserNameInDb.length > 0){
            res.status(403).send({
              error: 'Cet identifiant est déjà associé à un compte',
              token: null
            });
          } else {
            const newUser = {
              username: username,
              nickname: nickname,
              password: md5(password)
            }

            const insertNewUser = await db.collection('users').insertOne(newUser);
            const token = jwt.sign({ sub: username
                              }, JWT_KEY
                              , { expiresIn: '24h'});
            res.status(200).send({
              error: null,
              token
            });
          }
          client.close();
      }).catch(function(error){

          client.close();
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
