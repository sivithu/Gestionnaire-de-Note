const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const dbName = 'notes';


var ObjectId = require('mongodb').ObjectId;
var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;


module.exports = {
    signIn,
    signUp,
    getAllUsers
};

async function signUp({ username, password }) {
    var client = new MongoClient(url);
    client.
    client.connect()
        .then(async function(response){
            signInCheckingParams(username, password);
            const db = client.db(dbName);
            const sameUserNameInDb = await db.collection('users').find().toArray();

            console.log("AZERTYUIO");
            console.log("saleuserName: " + sameUserNameInDb);
            if(sameUserNameInDb){
                return {
                    error: 'Cet identifiant est déjà associé à un compte',
                    status: 400
                };
            } else {
                const newUser = {
                    username: username,
                    password: password
                }

                const allUsers = await db.collection('users').find().toArray();
                console.log("List of all users: " + allUsers);

                const insertNewUser = await db.collection('users').insertOne(newUser);
                const token = jwt.sign({ sub: user.id
                    }, config.secret
                    , { expiresIn: '0.01h'});
                client.close();
                return {
                    token,
                    error: null
                };
            }
            client.close();
        }).catch(function(error){
        client.close();
        return {
            error: 'Server error',
            status: 500
        }
    });

}

async function signIn() {
    var client = new MongoClient(url);

    client.connect()
        .then(async function(response){
            signInCheckingParams(username, password);
            // Check if username is already used return 400 + "Cet identifiant est déjà associé à un compte et retourner un code HTTP 400"

            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                const token = jwt.sign({ sub: user.id
                    }, config.secret
                    , { expiresIn: '24h'});
                return {
                    token,
                    error: null
                };
            }

            client.close();
        }).catch(function(error){
        console.log("Error server: " + error);
        client.close();
    });
};

async function getAllUsers(){
    var client = new MongoClient(url);

    client.connect()
        .then(async function(response){
            const db = client.db(dbName);
            const allUsers = await db.collection('users').find().toArray();

            console.log("Getting all users from db: " + allUsers);

            res.send({
                users: []
            })

            client.close();
        }).catch(function(error){
        client.close();
        ser.send({
            error: error,
            message: 'Server error'
        })
    });
}

async function signInCheckingParams(userName, password){
    if(password.length < 4){
        return {
            status: 400,
            error: 'Le mot de passe doit contenir au moins 4 caractères'
        };
    }
    if(userName.match(format) && !userName.match(/[a-z]/)){
        return {
            status: 400,
            error: 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées'
        };
    }
    if(userName.length < 2 || userName.length > 20){
        return {
            error: 'Votre identifiant doit contenir entre 2 et 20 caractères',
            status: 400
        }
    }
}
