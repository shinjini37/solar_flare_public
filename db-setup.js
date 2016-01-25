/* This file is an almost exact replica of the file from the 6.148 mongodb tutorial, with
necessary modifications made */
var mongo = require('mongodb').MongoClient;

//var dbConnectionUrl = 'mongodb://localhost:27017/test';

var dbConnectionUrl = 'mongodb://heroku_kq8blk5n:k8fd1dh1qkcaksa4ettk9hr9sr@ds047325.mongolab.com:47325/heroku_kq8blk5n';



var collections = {};


mongo.connect(dbConnectionUrl, function (err, db) {
  if (err) {
    console.log('Can not connect to MongoDB. Did you run it?');
    console.log(err.message);
    return;
  }

  collections.people = db.collection('people');
  collections.current = db.collection('current');
  collections.recentnums = db.collection('recentnums');
  collections.usernums = db.collection('usernums');
  collections.userfavusers= db.collection('userfavusers');
  collections.userfavnums= db.collection('userfavnums');
  
});


module.exports = collections;
