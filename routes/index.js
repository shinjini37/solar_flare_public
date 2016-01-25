var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');

var db_loaded = db;
 
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
                if (recents.length> 1000){
                    limit = 1000;
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
            res.render('index', {title: 'NumeraMusa', recent:recent, username: username, signed_in:signed_in, signed_in_as: sess.username});
      });
});


// <--------------------------------index page + profile page shared code------------------------------->


// <------------------------------------------musicplayer code------------------------------------------>

/* POST to enter_number */
router.post('/enter_number', function (req, res, next) {
    sess=req.session;
    
    
    /* This idea of handling asynchronous calls obtained from http://stackoverflow.com/questions/18008479/node-js-wait-for-multiple-async-calls */
    // for asynchronous calls
    var one = null;
    var two = null;
        
    var finished = function(){
        if (!(one === null) && !(two === null)){
            res.send(sess.username);    
        }
    }
    
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
        one = "one";
        finished();
        
    });
    
    // Adding the new entry to the db (recents by user)
    db.usernums.find({username: sess.username}).toArray(function (err, list){
        if (list.length>0){
            db.usernums.update({username: sess.username}, { $push: {recents:{num:userNum}}});
        } else { // if recentnums is empty, make an empty array and populate it
            db.usernums.insert({username: sess.username, recents:[]});
            db.usernums.update({username: sess.username}, { $push: {recents:{num:userNum}}});
        }
        two = "two";
        finished();        
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

router.post('/add_fav_num', function(req, res, next){
    sess=req.session;
    var num = req.body.current;
    var player = req.body.player;    
    db.userfavnums.find({username: sess.username}).toArray(function (err, list){
        var already_in = false;
        if (list.length>0){
            var fav_nums = list[0]['fav_nums'];
            for (var i = 0; i < fav_nums.length; i++) {
                if (fav_nums[i].num === num) {
                    already_in = true;
                    break;
                }
            } 
            if (!already_in){
                db.userfavnums.update({username: sess.username}, { $addToSet: {fav_nums:{num:num, player: player, visible:false}}});
            }
        } else { // if recentnums is empty, make an empty array and populate it
            db.userfavnums.insert({username: sess.username, fav_nums:[]});
            db.userfavnums.update({username: sess.username}, { $addToSet: {fav_nums:{num:num, player: player, visible:false}}});
        }
        // send back
        res.send(already_in);            
    });
});

router.post('/update_visible', function(req, res, next){
    sess=req.session;
    var change = req.body.change;
    change = JSON.parse(change);
    console.log(req.body);
    console.log(req.body.change);
    console.log(change);
    var arr = [];
    
    for(var x in change){
        arr.push(change[x]);
    }
    db.userfavnums.find({username: sess.username}).toArray(function (err, list){
        if (list.length>0){
            db.userfavnums.update({username: sess.username}, {$set:{fav_nums:arr}});
        }
        res.send(true);
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
      res.send(false);
    } else { 
      db.people.insert({'username': userName, 'password': password});
      sess.username = userName;
      res.send(true);
    }
  });

});


// Sign out
router.post('/signout', function (req, res, next) {
    // Destroy all the session variables
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// <------------------------------------------search user code------------------------------------------>

router.post('/find_user', function (req, res, next) {
    var username = req.body.username;
    console.log("username");
    console.log(req.body);
    db.people.find({'username': username}).toArray(function(err, list) {
        console.log(list);
        if (list.length>0){
            res.send(true);
        } else { 
            res.send(false);
        }
    });





});


// <------------------------------------------profile page code------------------------------------------>

/* GET profile. */
router.get('/profile/:username', function (req, res, next) {
    var username = req.params.username;
    var signed_in = false;
    var user_own_profile = false;
    var fav_users = [];
    var recent = [];
    var my_recent = [];    
    var in_fav_users= false;
    var fav_nums = [];
        
    // for asynchronous calls
    // TODO rename these
    var one = null;
    var two = null;
    var three = null;
    var four = null;
        
    var finished = function(){
        if (!(one === null) && !(two === null) && !(three === null)
                    && !(four === null)){
            console.log("fav_nums");
            console.log(fav_nums);
            res.render('profile', { title: username, signed_in_as: sess.username, username:username, 
                        signed_in: signed_in, user_own_profile:user_own_profile, 
                        fav_users:fav_users, in_fav_users: in_fav_users, fav_nums:fav_nums,
                        recent:recent, my_recent: my_recent});
        }
    }
    
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
                
                if (sess.username === username){ // if user's own profile
                    user_own_profile = true;
                } else { // if someone else's profile
                    user_own_profile = false;
                }
                
                

                //if logged in, show logged in
                if(!(typeof (sess.username) == 'undefined') && !(sess.username==='anon')){
                    signed_in = true;
                } else {//else, show anon
                    signed_in = false;
                }
                console.log("signed in");
                console.log(signed_in);
                
                // both when signed in or not
                // load all recent numbers
                db.recentnums.find({}).toArray(function(err, list){
                    recent = recent_nums(list, 5).recent;
                    three = "three";
                    finished();
                });
                
                // load fav nums, all if own profile, public if someone else's
                db.userfavnums.find({username:username}).toArray(function(err, list){
                    if (list.length>0){
                        // for rendering fav userlist
                        var fav_nums_raw = list[0]['fav_nums'];
                        if (user_own_profile){
                            for (var i = 0; i<fav_nums_raw.length; i++){
                                var num = fav_nums_raw[i].num;
                                var num_short = num;
                                var len = 5;
                                if (num.length>len){
                                    num_short = num.slice(0,len) + '...';
                                }
                                var anon;
                                var player = fav_nums_raw[i].player;
                                if (player === "anon"){
                                    anon = true;
                                } else {
                                    anon = false;
                                }
                                fav_nums.push({num:num, num_short: num_short, player: player, anon: anon, visibility:fav_nums_raw[i].visible, user_own_profile: user_own_profile });
                            }
                        } else {
                            for (var i = 0; i<fav_nums_raw.length; i++){
                                if (fav_nums_raw[i].visible){
                                    var num = fav_nums_raw[i].num;
                                    var num_short = num;
                                    var len = 5;
                                    if (num.length>len){
                                        num_short = num.slice(0,len) + '...';
                                    }
                                    var anon;
                                    var player = fav_nums_raw[i].player;
                                    if (player === "anon"){
                                        anon = true;
                                    } else {
                                        anon = false;
                                    }
                                    fav_nums.push({num:num, num_short: num_short, player: player, anon: anon, visibility:fav_nums_raw[i].visible, user_own_profile: user_own_profile});
                                }
                            }
                        }
                    }
                    four = "four";
                    finished();
                });

                // only if signed in
                if (signed_in){
                    // find all fav or check if user in favorite
                    db.userfavusers.find({username:sess.username}).toArray(function(err, list){
                        if (list.length>0){
                            // for rendering fav userlist
                            fav_users = list[0]['fav_users'];
                            // for checking if user in fav userlist
                            for (var i = 0; i < fav_users.length; i++) {
                                console.log(fav_users[i]);
                                if (fav_users[i].fav_username === username) {
                                    in_fav_users = true;
                                    break;
                                }
                            }
                        }
                        one = "one";
                        finished();
                    });

                    if (sess.username === username){ // if user's own profile
                        db.usernums.find({username:username}).toArray(function(err, list){
                            my_recent = recent_nums(list, 10, username).recent;
                            
                            two = "two";
                            finished();
                        });
                    } else { // if not user's own, don't load these
                        two = "two";
                        finished();
                    }
                } else { //if not signed in, don't load anything
                    one = "one";
                    two = "two";
                    finished();
                }
            }
        } else { // not registered
            res.redirect("/");
        }
    });

    
});


router.post("/add_fav_user", function(req, res, next){
    sess=req.session;

    // Catching variables passed in the form
    var fav_username = req.body.fav_username;
    
    if(!(typeof (sess.username) == 'undefined') && !(sess.username==='anon')){
        db.userfavusers.find({username: sess.username}).toArray(function (err, list){
            
            var already_in = false;
            
            if (list.length>0){
                
                var fav_users = list[0]['fav_users'];
                for (var i = 0; i < fav_users.length; i++) {
                    if (fav_users[i].fav_username === fav_username) {
                        already_in = true;
                        console.log("508");
                        db.userfavusers.update({username: sess.username}, { $pull: {fav_users:{fav_username:fav_username}}});
                        break;
                    }
                } 
                if (!already_in){
                    db.userfavusers.update({username: sess.username}, { $addToSet: {fav_users:{fav_username:fav_username}}});
                }
                    
                //db.userfavusers.update({username: sess.username}, { $addToSet: {fav_users:{fav_username:fav_username}}});
            } else { // if recentnums is empty, make an empty array and populate it
                db.userfavusers.insert({username: sess.username, fav_users:[]});
                db.userfavusers.update({username: sess.username}, { $addToSet: {fav_users:{fav_username:fav_username}}});

            }
            // send back
            res.send(already_in);            
        });
    }
    
});


module.exports = router;
