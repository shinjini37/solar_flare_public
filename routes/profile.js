var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');


/* GET home page. */
router.get('/:username', function (req, res, next) {
        var username = req.params.username;
          // showing recent numbers on number navigation
      
        var recentsasstring = '';
        var usersasstring = '';
        
        db.recentnums.find({}).toArray(function(err, list){
            if (list.length>0){
                var recents = list[0]['recents'];
                var limit;
                if (recents.length>10){
                    limit = 10;
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
            
            db.usernums.find({username:username}).toArray(function(err, list){
                if (list.length>0){
                    var recents = list[0]['recents'];
                    var limit;
                    if (recents.length>10){
                        limit = 10;
                    } else {
                        limit = recents.length;
                    }          
                    for (var i = 0; i<limit; i++){
                        var j = (recents.length - 1) - i;
                        var user_profile = '<a href="./profile/' + username + '">' + username + '</a>';
                        var user_number = recents[j].num;
                        var user_number_short = user_number;
                        if (user_number.length>5){
                            user_number_short = user_number.slice(0,5) + '...';
                        }
                        var user_number_play = '<div class="play_recent" style="display:inline-block" data-username='+recents[j].name+' data-num='+user_number+'>' + user_number_short +'</div>';//+ '<input type="text" class="hidden" style="display:none" value='+user_number+'></input></div>';
                        
                        usersasstring = usersasstring + ' <br> ' + user_profile + ' played ' + user_number_play;
                    }
                }
            // Rendering the index view with the title as the username
            res.render('profile', { title: username, username:username, mine: usersasstring, recents: recentsasstring});
          
        });

    });
});

module.exports = router;