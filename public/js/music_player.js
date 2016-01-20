$(document).ready(function(){
    var path = "./acoustic_grand_piano-mp3/";
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

/*    
    //get music paths
    
     $.ajax({
        url: '/get_musicpaths',
        data: {},
        type: 'GET',
        success: function(data) {
           sounds = data['sounds'];
        },
        error: function(xhr, status, error) {
            console.log("Uh oh there was an error: " + error);
        }

    });
*/    
    
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
    
    var play_music = function(music){
        var notestoplay_i = 0; 

        for (var i = 0; i< music.length; i++){
            if (!(i === music.length-1)){
                timeouts.push(setTimeout( function() {
                    music[notestoplay_i].play();
                    curr_index += 1;
                    notestoplay_i++;
                    }, i*300));
            } else {
                timeouts.push(setTimeout( function() {
                    music[notestoplay_i].play({
                        onfinish: function(){
                            paused = false;
                            curr_index = 0;
                            current_paused = current;
                    }});
                    
                    curr_index += 1;
                    notestoplay_i++;
                    }, i*300));
            }
        }
    }
    
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var notestoplay_music = convert(notestoplay_string);
        play_music(notestoplay_music);
    }

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
    
    var timeouts = [];
    var pie =  '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
    var current = pie;
    var user_playing = 'anon';
    var paused = false;
    var curr_index = 0;
    var current_music = [];


    //get current number and refresh player data
    
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

    // soundmanager setup    
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {


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
                        
                        update_music_info(data, number_entered);
                        
                        // play the number
                        current_music = convert(number_entered);
                        play_music(current_music);
                        //play_num(number_entered);

                        $.ajax({
                            url: '/update_recent',
                            data: {},
                            type: 'POST',
                            success: function(data) {
                                $(".recent").fadeOut(800, function() {
                                    $(".recent").html(data);
                                });
                                $(".recent").fadeIn().delay(2000);
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
            
            $(".play").click(function(){
                if (!(current_music.length>0)){
                    current_music = convert(pie);
                }
                if (paused === false){
                    //current_paused = current;
                    //play_num(current);
                    play_music(current_music);
                } else {
                    //current_paused = current_paused.slice(curr_index+1); 
                    //play_num(current_paused);
                    play_music(current_music.slice(curr_index));
                    //soundManager.resumeAll();
                }
                
            });
            $(".stop").click(function(){
                paused = false;
                curr_index = 0;
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
               //soundManager.stopAll(); 
            });
            
            $(".pause").click(function(){
                paused = true; 
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
                //soundManager.pauseAll();
            });
            
              
            $(".recent").on('click',".play_recent", function(){
                var num = $(this).data('num').toString();
                var username = $(this).data('username');
                $.ajax({
                    url: '/update_playing',
                    data: {current: num, player: username},
                    type: 'POST',
                    success: function(data) {
                        update_music_info(username, num);
                        current = num;
                        curr_index = 0;
                        
                        current_music = convert(num);
                        play_music(current_music);
                                
                        //play_num(num);
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