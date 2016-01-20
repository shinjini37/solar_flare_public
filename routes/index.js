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
        if (!sess.username){
            sess.username = 'anon';
        }
        if (!sess.curr_player){
            sess.curr_player = 'anon';
        }
        
        
        // showing recent numbers on number navigation
      
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
            console.log("username");
            console.log(sess.username);
            //if logged in, show logged in
            if(!(typeof (sess.username) === 'undefined') && !(sess.username==='anon')){
                console.log('logged in');
                var welcome = "<h2> Welcome, " + '<div class="welcome">'+ sess.username +'!</div>' + " </h2>";
                var signout = "<div class='sign-out'>" + " <button class='sign-out-button'>Sign Out</button>" + "</div>";
                res.render('index', {title: 'Numbers', recents: recentsasstring, welcome: welcome, login: signout, signin: '', signup: ''});
            } else {
                console.log('not logged in');
                // Rendering the index view with the title 'Sign Up'
                var welcome2 = "<h2> Welcome, " + '<div class="welcome">'+ "Guest!" +'</div>' + " </h2>";
                var signin = "<div class='sign-in'>" +
                        "<input type='text' class='username' placeholder='username'> <br>" +
                        "<input type='password' class='password' placeholder='password'> <br>" +
                        "<button class='sign-in-button'>Sign In</button>" +
                    "</div>";
                var signup = "<div class='sign-up'>" +
                        "<button class='sign-up-button'>Sign Up</button>" +
                    "</div>";
                res.render('index', { title: 'Numbers', recents: recentsasstring, welcome: welcome2, login:'', signin: signin, signup: signup});
            }
          
      });
      
});
/*
router.get('/recent_play', function(req, res, next){
    sess = req.session;
    var num = req.params.num;
    sess.curr = num;
    res.send(num);
});
*/

// update the playing info when a recent number is played
router.post('/update_playing', function(req, res, next){
    sess=req.session;
    sess.curr = req.body.current;
    sess.curr_player = req.body.player;    
    res.send({});
});
/*for updating recents*/
/*
router.get('/update_recents', function(req, res, next){
    var recentsasstring = recentsasstring();
    res.send(recentsasstring);
});
*/

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
/*
router.get('/play', function (req, res, next) {
    sess=req.session;
    res.send(sess.curr);
    /*
    db.current.find({_id: 'current'}).toArray(function(err, list){
        var curr = list[0]['current'];
        res.send(curr); 
    })
    
});
*/

/* GET current user and number*/
router.get('/get_current', function (req, res, next) {
    sess=req.session;
    res.send({num:sess.curr, curr_player: sess.curr_player});
       
});




/* POST to enter_number */
router.post('/enter_number', function (req, res, next) {
    sess=req.session;

    // Catching variables passed in the form
    var userNum = req.body.num;
    
    // update current number
    
    sess.curr = userNum;
    sess.curr_player = sess.username;
    //db.current.update({_id: 'current'}, {$set: {'current': userNum}});
    
    // Adding the new entry to the db
    db.recentnums.find({}).toArray(function (err, list){
        if (list.length>0){
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: sess.username, num:userNum}}});
        } else { // if recentnums is empty, make an empty array and populate it
            db.recentnums.insert({_id: "recents", recents:[]});
            db.recentnums.update({_id: "recents"}, { $push: {recents:{name: sess.username, num:userNum}}});
        }
        
        
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
    res.send(sess.username);

});

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

router.post('/signout', function (req, res, next) {
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else
        {
            console.log('loggingout');    
        res.redirect('/');
        }
    });
});

router.post('/update_recent', function (req, res, next) {
    // showing recent numbers on number navigation
      
    var recentsasstring = '<br>';
    
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
        //if logged in, show logged in
        res.send(recentsasstring);
    });
});

module.exports = router;
