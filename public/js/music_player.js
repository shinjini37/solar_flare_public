$(document).ready(function(){
    // paths to the sound files to be used
    var path = "/acoustic_grand_piano-mp3/";
    var sounds = [
    path + "60" + ".mp3",
    path + "62" + ".mp3",  
    path + "64" + ".mp3",
    path + "65" + ".mp3",
    path + "67" + ".mp3",
    path + "69" + ".mp3",
    path + "71" + ".mp3",
    path + "72" + ".mp3",
    path + "74" + ".mp3",
    path + "76" + ".mp3",
    ];

    var update_sounds = function() {
                // update sounds
        var key = Number($("#pitch").val());
        key += Number($("#accidental").val());
        var key_type = $("#key_type").val();
        if (isNaN(key)){
            key = 60;
        }
        if(key_type === undefined){
            key_type = "major";
        }

        var scale;
        if (key_type === "major") {
            scale = [0, 2, 2, 1, 2, 2, 2, 1, 2, 2];
        } else if (key_type === "harmonic minor") {
            scale = [0, 2, 1, 2, 2, 1, 3, 1, 2, 1];
        } else if (key_type === "natural minor") {
            scale = [0, 2, 1, 2, 2, 1, 2, 2, 2, 1];
        }
        console.log(scale);
        for (var i = 0; i<10; i++) {
            key += scale[i];
            sounds[i] = path + key.toString() + ".mp3";
        }
        // sounds is updated
    }

    // convert a number string to an array of Soundmanager sound files
    var convert = function(notestoplay_string){
        update_sounds();
        var notestoplay_music = [];
        for (var i = 0; i< notestoplay_string.length; i++){
            var currnote = soundManager.createSound({
                            url: sounds[notestoplay_string[i]]
                            });
            notestoplay_music.push(currnote);
        }
        return notestoplay_music;        
    }
    
    // plays the given array of sound files in sequence with an interval
    // of 0.3 seconds
    var play_music = function(music){
        var notestoplay_i = 0; 
        var beat = 2000/(($('.actu-tempo').val())*($('.actu-tempo').val()));
        if (isNaN(beat)){
            beat = 300;
        }
        
        
        for (var i = 0; i< music.length; i++){
            if (!(i === music.length-1)){
                timeouts.push(setTimeout( function() {
                    music[notestoplay_i].play();
                    curr_index += 1;
                    notestoplay_i++;
                    }, (.5+i)*beat));
            } else { // on the last note, reset variables
                timeouts.push(setTimeout( function() {
                    music[notestoplay_i].play({
                        onfinish: function(){
                            paused = false;
                            music_playing = false;
                            curr_index = 0;
                        }});
                    curr_index += 1;
                    notestoplay_i++;
                    }, (.5+i)*beat));
            }
        }
    }
    
    // play numbers in a given string
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var notestoplay_music = convert(notestoplay_string);
        play_music(notestoplay_music);
    }

    var update_musicplayer_display = function(username, num){
        // update musicplayer display
        var musicplayer_lim = 50;
        if(num.length>musicplayer_lim){
            $(".playing").text(num.slice(0, musicplayer_lim) + '...');    
        } else {
            $(".playing").text(num);    
        }
        $(".user").text(" by " + username);        
    };
    
    var update_music_display = function(username, num){
        // show entered number
        var num_display_lim = 100;
        if(num.length>num_display_lim){
            $(".entered-number").text(num.slice(0, num_display_lim) + '...');    
        } else {
            $(".entered-number").text(num);    
        }

    };

    // update the musicplayer display number and artist
    var update_music_info = function(username, num){
        $(".viewer").css("display", "block");
        user_playing = username;
        update_musicplayer_display(username, num);
        update_music_display(username, num);
        $(".intro-container").css("display", "none");
    };
    
    
    // variables
    var timeouts = [];
    /* 1000 places of pi obtained from http://www-groups.dcs.st-and.ac.uk/history/HistTopics/1000_places.html*/
    var pie =   '314159265358979323846264338327950288419716939937510'+
                '58209749445923078164062862089986280348253421170679'+
                '82148086513282306647093844609550582231725359408128'+
                '48111745028410270193852110555964462294895493038196'+
                '44288109756659334461284756482337867831652712019091'+
                '45648566923460348610454326648213393607260249141273'+
                '72458700660631558817488152092096282925409171536436'+
                '78925903600113305305488204665213841469519415116094'+
                '33057270365759591953092186117381932611793105118548'+
                '07446237996274956735188575272489122793818301194912'+
                '98336733624406566430860213949463952247371907021798'+
                '60943702770539217176293176752384674818467669405132'+
                '00056812714526356082778577134275778960917363717872'+
                '14684409012249534301465495853710507922796892589235'+
                '42019956112129021960864034418159813629774771309960'+
                '51870721134999999837297804995105973173281609631859'+
                '50244594553469083026425223082533446850352619311881'+
                '71010003137838752886587533208381420617177669147303'+
                '59825349042875546873115956286388235378759375195778'+
                '18577805321712268066130019278766111959092164201989'
                
    
    var current = pie;
    var user_playing = 'anon';
    var music_playing = false;
    var paused = false;
    var curr_index = 0;
    var current_music = [];


    // refresh musicplayer data to display
    // if not signed in, it should just show pi
    // if signed in, it shows user's history
    $.ajax({
        url: '/check_signedin',
        data: {},
        type: 'GET',
        success: function(signed_in) {
            console.log("signed in");
            console.log(signed_in);
            // if not signed in 
            // show pi
            if (!signed_in){
                $.ajax({
                    url: '/update_playing',
                    data: {current: pie, player: "NumeraMusa"},
                    type: 'POST',
                    success: function(data) {
                        // update musicplayer display
                        update_musicplayer_display("NumeraMusa", pie);                        
                        $(".intro-container").css("display", "block");
                        $(".viewer").css("display", "none");
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }
                });
            } else{ // show history
                $.ajax({
                    url: '/get_current',
                    data: {},
                    type: 'GET',
                    success: function(data) {
                        current = data['num'];
                        user_playing = data['curr_player'];
                        update_music_info(user_playing, current); 
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }
    });

    /* Soundmanager obtained from http://www.schillmania.com/projects/soundmanager2*/
    // soundmanager setup    
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {

            // when a new number is entered by user
            $(".enter-number-button").click(function() {

                // get the number
                var number_entered = $(".enter-number-text").val();
                
                /* This method of taking out only the number is obtained from http://stackoverflow.com/questions/10003683/javascript-get-number-from-string*/
                // take out only the number
                number_entered = number_entered.match(/\d/g);
                number_entered = number_entered.join("");
                
                // send the AJAX request
                $.ajax({
                    url: '/enter_number',
                    data: {
                        'num': number_entered
                    },
                    type: 'POST',
                    success: function(data) {
                        
                        // clear text
                        $(".enter-number-text").val("");
                        
                        //update current number
                        current = number_entered;
                        curr_index = 0;
                        
                        // update music display info
                        update_music_info(data, number_entered);
                        
                        // play the number
                        current_music = convert(number_entered);
                        play_music(current_music);
                        music_playing = true;

                        // update recent in database
                        $.ajax({
                            url: '/update_recent_numbers',
                            data: {},
                            type: 'POST',
                            success: function(data) {
                                $(".recent-list").fadeOut(800, function() {
                                    // changing the html to the data recieved
                                    $(".recent-list").html(data);
                                });
                                $(".recent-list").fadeIn().delay(2000);
                            },
                            error: function(xhr, status, error) {
                                console.log("Uh oh there was an error: " + error);
                            }
                        });     
                        
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }

                });
            });
            
            // when play button is clicked
            $(".play").click(function(){
                // if the user is not signed in, refreshing should reset the musicplayer
                // send ajax request to check
                $.ajax({
                    url: '/check_signedin',
                    data: {},
                    type: 'GET',
                    success: function(signed_in) {
                        // if not signed in or no music has been selected, 
                        // set to default
                        if (!signed_in && !(current_music.length>0)){
                            current_music = convert(pie);
                        }
                        
                        // only play if it isn't playing already
                        if (!music_playing){
                            music_playing = true; // in either case, music will be played
                            // if not paused, play current music selected
                            if (!paused){
                                if (!(current_music.length>0)){
                                    current_music = convert(current);
                                }
                                update_music_info(user_playing, current);
                                play_music(current_music);
                            } else { // if paused, play from where it was paused
                                play_music(current_music.slice(curr_index));
                            }
                        }         
                    },
                    error: function(xhr, status, error) {
                        alert("Sorry, there was an error...");
                        console.log("Uh oh there was an error: " + error);
                    }
                });
            });

            // when stop button is clicked
            $(".stop").click(function(){
                // reset values
                paused = false;
                music_playing = false;
                curr_index = 0;
                
                // clear out all music set to be played later
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                //quick reset of the timer array you just cleared
                timeouts = [];
            });
            
            // when pause button is clicked
            $(".pause").click(function(){
                // set values
                paused = true; 
                music_playing = false;
                
                /* This method of clearing timeouts obtained from http://stackoverflow.com/questions/8860188/is-there-a-way-to-clear-all-time-outs */
                // clear out all music set to be played later
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
            });
            
            /* Adding event listeners on dynamically created elements obtained from 
            http://stackoverflow.com/questions/2552745/dynamically-add-listener-to-ajax-created-content-in-jquery */
            // when a recent number is clicked to be played              
            $(".recent").on('click',".play_recent", function(){
                // get data to play the music
                var num = $(this).data('num').toString();
                var username = $(this).data('username');
                
                // update database session variables
                $.ajax({
                    url: '/update_playing',
                    data: {current: num, player: username},
                    type: 'POST',
                    success: function(data) {
                        // stop all previous music
                        // reset values
                        paused = false;
                        music_playing = false;
                        curr_index = 0;
                        
                        // clear out all music set to be played later
                        for (var i = 0; i < timeouts.length; i++) {
                            clearTimeout(timeouts[i]);
                        }
                        //quick reset of the timer array you just cleared
                        timeouts = [];
                        
                        // update playing variable
                        music_playing = true;
                        // update displayed info
                        update_music_info(username, num);
                        current = num;
                        curr_index = 0;
                        
                        // play music
                        current_music = convert(num);
                        play_music(current_music);
                    },
                    error: function(xhr, status, error) {
                        alert("Sorry, there was an error...");
                        console.log("Uh oh there was an error: " + error);
                    }
                });
                
            });
            
            $(".copy").click(function(){
                $(".enter-number-text").val(current);
            });
            
            
            $(".add-fav-number").click(function(){
               $(".add-fav-number").text("Saving..."); 
               $(".add-fav-number").attr('disabled', true); 
               $.ajax({
                  url: '/add_fav_num',
                    data: {current: current, player: user_playing},
                    type: 'POST',
                    success: function(data) {
                        $(".add-fav-number").text("Added!"); 
                        $(".add-fav-number").attr('disabled', false);
                        setTimeout( function() { $(".add-fav-number").text("Add to favorite numbers!"); 
                                        }, 500)
                    },
                    error: function(xhr, status, error) {
                        alert("Sorry, there was an error...");
                        $(".add-fav-number").text("Add to favorite numbers!"); 
                        $(".add-fav-number").attr('disabled', false);
                        
                        console.log("Uh oh there was an error: " + error);
                    }
               }); 
            });
        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            console.log("soundmanager2 error");
        }
    }); 
});

        
