# MongoDB-test

To start, run the **node connection.js** command. And then:

step 1: Enter into the MongoDB shell.

mongo

step 2: for the display all the databases.

show dbs;

step 3: for a select database :

use 'test'

step 4: for statistics of your database.

db.stats()

step 5: listing out all the collections(tables).

show collections

step 6:print the data from a particular collection.

db.'collection_name'.find().pretty()
