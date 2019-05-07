# Gestion de note de frais

Projet scolaire dont le but est de créer une api permettant la gestion de notes de frais en javascript et node.

Cette API pourra ensuite être consommée par une application mobile (Android ou IOS) pour permettre une utilisatation plus lisible et simple pour l'utilisateur.



## Installation

- Cloner le repo  :

  `$ git clone https://github.com/RamzyK/Gestionnaire-de-Note.git`

- Pour lancer l'API en local :

  `$ npm run start`

- Les test de l'API peuvent se faire sur [PostMan](https://www.getpostman.com/).

## Usage

Après avoir cloné le projet, et lancer l'API en local vous aurez plusieurs routes à disposition pour gérer les utilisateurs et les notes :

- POST /signup

Cette route permet de créer un compte utilisateur, à partir d'un identifiant et mot de passe choisis par l'utilisateur.

Le corps de la requête doit contenir :

- ***username*** : identifiant unique choisi par l'utilisateur.
- ***password*** : mot de passe choisi par l'utilisateur.

*Exemple*:

​	`{ username : 'aaaa', password : 'password'}`



- POST /signin

Cette route permet à un utilisateur de se connecter à son compte, en fournissant son identifiant et son mot de passe.

Le corps de la requête dit contenir :

- ***username*** : identifiant unique choisi par l'utilisateur.
- ***password*** : mot de passe choisi par l'utilisateur.

*Exemple* :

​	`{ username : 'aaaa', password : 'aaaa' }`



- GET / notes

Cette route permet à un utilisateur connecté de lister ses notes, dans l'ordre anti-chronologique de création.

Le jeton JWT de l'utilisateur connecté doit être fourni dans le header.



- PUT /notes

Cette route permet à un utilisateur connecté d'ajouter une note'.

Le jeton JWT de l'utilisateur connecté doit être fourni dans le header.

Le corps de la requête doit contenir :

- ***content*** : contenu de la note saisi par l'utilisateur

*Exemple* :

​	`{content : 'Note'}`



- PATCH /notes/:id

Cette route permet à un utilisateur connecté de modifié une note existante.

Le jeton JWT de l'utilisateur connecté doit être fourni dans le header.

Le paramètre *id* doit contenir l'identifiant unique de la note à modifier.

Le corps de la requête doit contenir :

- ***content*** : contenu de la note saisie par l'utilisateur. (mise à jour)

*Exemple* :

​	`{ content : 'Note 1' }`



- DELETE /notes/:id

Cette route permet à un utilisateur connecté de supprimer une de ses notes.

Le jeton JWT de l'utilisateur connecté doit être fourni dans le header.

Le paramètre *id* doit contenir l'identifiant unique de la note à modifier.

