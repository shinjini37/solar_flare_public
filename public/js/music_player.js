$(document).ready(function(){
    // paths to the sound files to be used
    var path = "/acoustic_grand_piano-mp3/";
    var sounds = [
    path + "C4.mp3",
    path + "D4.mp3",  
    path + "E4.mp3",
    path + "F4.mp3",
    path + "G4.mp3",
    path + "A4.mp3",
    path + "B4.mp3",
    path + "C5.mp3",
    path + "D5.mp3",
    path + "E5.mp3",
    ];

    // convert a number string to an array of Soundmanager sound files
    var convert = function(notestoplay_string){
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

        for (var i = 0; i< music.length; i++){
            if (!(i === music.length-1)){
                timeouts.push(setTimeout( function() {
                    music[notestoplay_i].play();
                    curr_index += 1;
                    notestoplay_i++;
                    }, (.5+i)*300));
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
                    }, (.5+i)*300));
            }
        }
    }
    
    // play numbers in a given string
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var notestoplay_music = convert(notestoplay_string);
        play_music(notestoplay_music);
    }

    // update the musicplayer display number and artist
    var update_music_info = function(username, num){
        // show entered number
        var num_display_lim = 100;
        if(num.length>num_display_lim){
            $(".entered-number").text(num.slice(0, num_display_lim) + '...');    
        } else {
            $(".entered-number").text(num);    
        }

        // update musicplayer display
        var musicplayer_lim = 25;
        if(num.length>musicplayer_lim){
            $(".playing").text(num.slice(0, musicplayer_lim) + '...');    
        } else {
            $(".playing").text(num);    
        }
        $(".user").text(" by " + username);
    };
    
    
    // variables
    var timeouts = [];
    var pie = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
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
            if (!signed_in && !(current_music.length>0)){
                $.ajax({
                    url: '/update_playing',
                    data: {current: pie, player: "Numbers"},
                    type: 'POST',
                    success: function(data) {
                        update_music_info('Numbers', pie);
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

    // soundmanager setup    
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {

            // when a new number is entered by user
            $(".enter-number-button").click(function() {

                // get the number
                var number_entered = $(".enter-number-text").val();
                
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
                                $(".recent-update").fadeOut(800, function() {
                                    // changing the html to the data recieved
                                    $(".recent-update").html(data);
                                });
                                $(".recent-update").fadeIn().delay(2000);
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
                        if (!signed_in || !(current_music.length>0)){
                            current_music = convert(pie);
                        }
                        
                        // only play if it isn't playing already
                        if (!music_playing){
                            music_playing = true; // in either case, music will be played
                            // if not paused, play current music selected
                            if (!paused){
                                play_music(current_music);
                            } else { // if paused, play from where it was paused
                                play_music(current_music.slice(curr_index));
                            }
                        }         
                    },
                    error: function(xhr, status, error) {
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
                
                // clear out all music set to be played later
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
            });
            
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

        
