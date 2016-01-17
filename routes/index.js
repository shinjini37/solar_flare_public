var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');
var sess;

var pie = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';


/* GET home page. */
router.get('/', function (req, res, next) {

  // Session Variables
  sess=req.session;
  // Current number
  if (!sess.curr){
    sess.curr = pie;    
  }
  
  // showing recent numbers on number navigation
  var recentsasstring = '';
  db.recentnums.find({}).toArray(function(err, list){
      if (list.length>0){

          var recents = list[0]['recents'];
          //console.log(recents);
          var limit;
          if (recents.length>10){
              limit = 10;
          } else {
              limit = recents.length;
          }          
          //console.log("limit");
          //console.log(limit);
          
          for (var i = 0; i<limit; i++){
              var j = (recents.length - 1) - i;
              recentsasstring = recentsasstring + ' <br> ' + recents[j].name + ' played ' + recents[j].num;
              console.log(recentsasstring);
          }
      }
      console.log("recents as string:")
      console.log(recentsasstring);
      // Rendering the index view with the title 'Sign Up'
      res.render('index', { title: 'Numbers', recents: recentsasstring});
  });


    
    
  // Changing current number to play to pi
  /*
  db.current.find({}).toArray(function (err, currentval) {
      if (!(currentval.length>0)){
          db.current.update({_id: 'current'}, {$set: {'current': pie}}); // this is buggy, if another user refreshes,
                                              // everyone's current goes to pie. 
      } 
  });
  */
});

/* GET test */

router.get('/test', function (req, res, next) {

    // prints stuff, for debugging
    db.current.find({}).toArray(function (err, currents) {
    var curreturn = [];
    currents.forEach(function (current) {
      curreturn.push(current.current);
    });
    console.log(curreturn[0]);
    res.send(curreturn[0]);
  });

});

/* GET play usernumber*/
router.get('/play', function (req, res, next) {
    sess=req.session;
    res.send(sess.curr);
    /*
    db.current.find({_id: 'current'}).toArray(function(err, list){
        var curr = list[0]['current'];
        res.send(curr); 
    })
    */
});


/* POST to enter_number */
router.post('/enter_number', function (req, res, next) {

	// Catching variables passed in the form
	var userName = req.body.username;
	var userNum = req.body.num;
    
    // update current number
    sess=req.session;
    sess.curr = userNum;
    //db.current.update({_id: 'current'}, {$set: {'current': userNum}});
    
	// Adding the new entry to the db
    db.recentnums.find({}).toArray(function (err, list){
        if (list.length>0){
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: userName, num:userNum}}});
        } else { // if recentnums is empty, make an empty array and populate it
            db.recentnums.insert({_id: "recents", recents:[]});
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: userName, num:userNum}}});
        }
    });
    // send back the number entered
    res.send(userNum);
});

router.post('/signin', function (req, res, next) {
  var userName = req.body.username;
  var password = req.body.password;
  console.log("120:");
  console.log(userName);
  console.log(password);

  db.people.find({'username': userName}).toArray(function(err, list) {
    console.log(list);
    if (list.length>0){
      if (password === list[0]['password']) {
        res.send("sign in successfully.");
      } else {
        res.send("wrong password.");
      }
    } else {
      res.send("username does not exist.")
    }
  });

});

router.post('/signup', function (req, res, next) {
  var userName = req.body.username;
  var password = req.body.password;
  console.log("142:");
  console.log(userName);
  console.log(password);

  db.people.find({'username': userName}).toArray(function(err, list) {
    console.log(list);
    if (list.length>0){
      res.send("username already exists.");
    } else { 
      db.people.insert({'username': userName, 'password': password});
      res.send("sign up successfully.");
    }
  });

});

module.exports = router;
