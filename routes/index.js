var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');
var sess;

var pie = '314159265358979323846264338327950288419716939937510582';


/* GET home page. */
router.get('/', function (req, res, next) {

  // Rendering the index view with the title 'Sign Up'
  res.render('index', { title: 'Numbers'});
  
  // Session Variables
  sess=req.session;
  // Current number
  if (!sess.curr){
    sess.curr = pie;    
  }
  
  
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
    sess.curr = userNum;
    //db.current.update({_id: 'current'}, {$set: {'current': userNum}});
    
	// Adding the new entry to the db
    db.recentnums.find({}).toArray(function(err, list){
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

module.exports = router;
