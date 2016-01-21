var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');

// For session variables
var sess;

// The default number to be played
var pie = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';

// <------------------------------------------index page code------------------------------------------>

/* GET home page. */
router.get('/', function (req, res, next) {

        // Session Variables
        sess=req.session;
        // Initialize all session variables, if not initialized
        if (!sess.curr){
            sess.curr = pie;    
        }
        if (!sess.username){
            sess.username = 'anon';
        }
        if (!sess.curr_player){
            sess.curr_player = 'anon';
        }
        
        // showing recently played numbers on number navigation
        var recentsasstring = '';
        
        db.recentnums.find({}).toArray(function(err, list){
            if (list.length>0){
                var recents = list[0]['recents'];
                var limit;
                if (recents.length>20){
                    limit = 20;
                } else {
                    limit = recents.length;
                }          
                for (var i = 0; i<limit; i++){
                    var j = (recents.length - 1) - i;
                    var user_profile = '<a href="./profile/' + recents[j].name + '">' + recents[j].name + '</a>';
                    var user_number = recents[j].num;
                    var user_number_short = user_number;
                    if (user_number.length>5){
                        user_number_short = user_number.slice(0,5) + '...';
                    }
                    var user_number_play = '<div class="play_recent" style="display:inline-block" data-username='+recents[j].name+' data-num='+user_number+'>' + user_number_short +'</div>';//+ '<input type="text" class="hidden" style="display:none" value='+user_number+'></input></div>';
                    
                    recentsasstring = recentsasstring + ' <br> ' + user_profile + ' played ' + user_number_play;
                }
            }
            //if logged in, show logged in
            if(!(typeof (sess.username) === 'undefined') && !(sess.username==='anon')){
                var welcome = "<h2> Welcome, " + '<div class="welcome">'+ sess.username +'!</div>' + " </h2>";
                var signout = "<div class='sign-out'>" + " <button class='sign-out-button'>Sign Out</button>" + "</div>";
                // Render index page with all the info gotten
                res.render('index', {title: 'Numbers', recents: recentsasstring, welcome: welcome, login: signout, signin: '', signup: ''});
            } else {//else, show anon
                var welcome2 = "<h2> Welcome, " + '<div class="welcome">'+ "Guest!" +'</div>' + " </h2>";
                var signin = "<div class='sign-in'>" +
                        "<input type='text' class='username' placeholder='username'> <br>" +
                        "<input type='password' class='password' placeholder='password'> <br>" +
                        "<button class='sign-in-button'>Sign In</button>" +
                    "</div>";
                var signup = "<div class='sign-up'>" +
                        "<button class='sign-up-button'>Sign Up</button>" +
                    "</div>";
                // Render index page with all the info gotten
                res.render('index', { title: 'Numbers', recents: recentsasstring, welcome: welcome2, login:'', signin: signin, signup: signup});
            }
      });
});

// <--------------------------------index page + profile page shared code------------------------------->


// <------------------------------------------musicplayer code------------------------------------------>

/* POST to enter_number */
router.post('/enter_number', function (req, res, next) {
    sess=req.session;

    // Catching variables passed in the form
    var userNum = req.body.num;
    
    // update current number and player
    sess.curr = userNum;
    sess.curr_player = sess.username;
    
    // Adding the new entry to the db (recents by everyone)
    db.recentnums.find({}).toArray(function (err, list){
        if (list.length>0){
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: sess.username, num:userNum}}});
        } else { // if recentnums is empty, make an empty array and populate it
            db.recentnums.insert({_id: "recents", recents:[]});
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: sess.username, num:userNum}}});
        }

        // Adding the new entry to the db (recents by user)
        db.usernums.find({username: sess.username}).toArray(function (err, list){
            if (list.length>0){
                db.usernums.update({username: sess.username}, { $push: {recents:{num:userNum}}});
            } else { // if recentnums is empty, make an empty array and populate it
                db.usernums.insert({username: sess.username, recents:[]});
                db.usernums.update({username: sess.username}, { $push: {recents:{num:userNum}}});
            }
        });
    });
    
    // send back the username
    // do we need to?
    res.send(sess.username);

});


// update the playing info when a recent number is played
router.post('/update_playing', function(req, res, next){
    sess=req.session;
    sess.curr = req.body.current;
    sess.curr_player = req.body.player;    
    res.send({});
});

/* GET current player and number*/
router.get('/get_current', function (req, res, next) {
    sess=req.session;
    res.send({num:sess.curr, curr_player: sess.curr_player});
});

// updating recent numbers on number navigation
router.post('/update_recent', function (req, res, next) {
      
    var recentsasstring = '';
    
    db.recentnums.find({}).toArray(function(err, list){
        if (list.length>0){
            var recents = list[0]['recents'];
            var limit;
            if (recents.length>20){
                limit = 20;
            } else {
                limit = recents.length;
            }          
            for (var i = 0; i<limit; i++){
                var j = (recents.length - 1) - i;
                var user_profile = '<a href="./profile/' + recents[j].name + '">' + recents[j].name + '</a>';
                var user_number = recents[j].num;
                var user_number_short = user_number;
                if (user_number.length>5){
                    user_number_short = user_number.slice(0,5) + '...';
                }
                var user_number_play = '<div class="play_recent" style="display:inline-block" data-username='+recents[j].name+' data-num='+user_number+'>' + user_number_short +'</div>';//+ '<input type="text" class="hidden" style="display:none" value='+user_number+'></input></div>';
                
                recentsasstring =  recentsasstring + ' <br> ' + user_profile + ' played ' + user_number_play;
            }
        }

        res.send(recentsasstring);
    });
});


// <------------------------------------------user session code------------------------------------------>


// Sign in
router.post('/signin', function (req, res, next) {
  sess=req.session;
  var userName = req.body.username;
  var password = req.body.password;

  db.people.find({'username': userName}).toArray(function(err, list) {
    console.log(list);
    if (list.length>0){
      if (password === list[0]['password']) {
        sess.username = userName;
        res.send("sign in successfully.");
      } else {
        res.send("wrong password.");
      }
    } else {
      res.send("username does not exist.")
    }
  });

});


// Sign up
router.post('/signup', function (req, res, next) {
  var userName = req.body.username;
  var password = req.body.password;

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


// Sign out
router.post('/signout', function (req, res, next) {
    // Destroy all the session variables
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else
        {
            res.redirect('/');
        }
    });
});

// <------------------------------------------profile page code------------------------------------------>


module.exports = router;
