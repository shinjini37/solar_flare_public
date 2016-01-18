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
    var paused = false;
    var curr_index = 0;
    var current_music;
    
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {
            current_music = convert(pie);

            $(".enter-number-button").click(function() {

                // get the number
                var number_entered = $(".enter-number-text").val();
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
                        play_num(number_entered);        
                        
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }

                });
            });
            
            $(".play").click(function(){
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
            
              
            $(".play_recent").on('click', function(){
                var num = $(this).data('num').toString();
                var username = $(this).data('username');
                update_music_info(username, num);
                current = num;
                curr_index = 0;
                        
                play_num(num);
            });

        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            console.log("soundmanager2 error");
        }
    }); 
});