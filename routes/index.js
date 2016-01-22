var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');

// For session variables
var sess;

// The default number to be played
var pie = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';

// for updating the recent numbers list
// username only for when user is viewing their own profile
var recent_nums = function(list, len, username){
    var recentsasstring = '';
    var recent = [];
        if (list.length>0){
                var recents = list[0]['recents'];
                var limit;
                if (recents.length> 100){
                    limit = 100;
                } else {
                    limit = recents.length;
                }          
                for (var i = 0; i<limit; i++){
                    var j = (recents.length - 1) - i;
                    var user_profile;
                    if (username){
                        var player = username;
                    } else {
                        var player = recents[j].name;
                    }
                    var anon;
                    if (player === "anon"){
                        anon = true;
                        user_profile = 'anon';    
                    } else {
                        anon = false;
                        user_profile = '<a href="./profile/' + player + '">' + player + '</a>';
                    }
                    var user_number = recents[j].num;
                    var user_number_short = user_number;
                    if (user_number.length>len){
                        user_number_short = user_number.slice(0,len) + '...';
                    }
                    var user_number_play = '<div class="play_recent" style="display:inline-block" data-username='+player+' data-num='+user_number+'>' + user_number_short +'</div>';
                    
                    recentsasstring =  recentsasstring + user_profile + ' played ' + user_number_play + ' <br> ';
                    recent.push({anon: anon, player:player, user_number: user_number, user_number_short:user_number_short});
                    
                }
        }
        return {recentasstring: recentsasstring, recent: recent};
}

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
        var recent = [];
        db.recentnums.find({}).toArray(function(err, list){
            recent = recent_nums(list, 5).recent;
            var signed_in;
            var username;
            //if logged in, show logged in
            if(!(typeof (sess.username) == 'undefined') && !(sess.username==='anon')){
                signed_in = true;
                username = sess.username;
            } else {//else, show anon
                signed_in = false;
                username = "Guest";
            }
            // Render index page with all the info gotten
            res.render('index', {title: 'NumeraMusa', recent:recent, username: username, signed_in:signed_in});
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
            // send back the username
            // do we need to?
            res.send(sess.username);
        });
    });
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

/* GET username*/
router.get('/get_username', function (req, res, next) {
    sess=req.session;
    res.send(sess.username);
});

router.get('/check_signedin', function(req, res, next){
   sess=req.session;
   if (!(typeof (sess.username) == 'undefined') && !(sess.username==='anon')){ //signed in
       res.send(true);
   } else {
       res.send(false);
   } 
});

// updating recent numbers on number navigation
router.post('/update_recent_numbers', function (req, res, next) {
      
    var recentsasstring = '';
    
    db.recentnums.find({}).toArray(function(err, list){
        recentsasstring = recent_nums(list, 5).recentasstring;
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
        res.send(true);
      } else {
        res.send("Incorrect password.");
      }
    } else {
      res.send("Username does not exist.")
    }
  });

});


// Sign up
router.post('/signup', function (req, res, next) {
  sess=req.session;
  
  var userName = req.body.username;
  var password = req.body.password;

  db.people.find({'username': userName}).toArray(function(err, list) {
    console.log(list);
    if (list.length>0){
      res.send("Username already exists.");
    } else { 
      db.people.insert({'username': userName, 'password': password});
      sess.username = userName;
      res.send("Signed up successfully!");
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

/* GET profile. */
router.get('/profile/:username', function (req, res, next) {
    var username = req.params.username;
    db.people.find({'username': username}).toArray(function(err, list) {
        if (list.length>0){ // only registered users get profiles
            if (username === 'anon'){ // anon doesn't have a profile
                res.redirect("/");
            } else { // everyone else gets profiles
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

                // showing recent numbers on number navigation

                var recent = [];
                var my_recent = [];
                
                db.recentnums.find({}).toArray(function(err, list){
                    if (sess.username === username){ // if user's own profile
                        var user_own_profile = true;
                        recent = recent_nums(list, 5).recent;
                        
                        db.usernums.find({username:username}).toArray(function(err, list){
                            my_recent = recent_nums(list, 10, username).recent;
                            // Rendering the index view with the title as the username
                            res.render('profile', { title: username, username:username, user_own_profile:user_own_profile, recent:recent, my_recent: my_recent});
                        });
                    } else { // if someone else's profile
                        var user_own_profile = false;
                        recent = recent_nums(list, 5).recent;
                        // Rendering the index view with the title as the username
                        res.render('profile', { title: username, username:username, user_own_profile:user_own_profile, recent:recent});
                    }
                    
                });
            }
        } else { // not registered
            res.redirect("/");
        }
    });

    
});



module.exports = router;
