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
    
    var timeouts = [];
    var pie = '314159265358979323846264338327950288419716939937510582';
    var current = pie;
    var paused = false;
    var curr_index = 0;
    
        
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
    
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var notestoplay_music = convert(notestoplay_string);
        var notestoplay_i = 0; 

        for (var i = 0; i< notestoplay_string.length; i++){
            timeouts.push(setTimeout( function() {
                notestoplay_music[notestoplay_i].play();
                console.log(notestoplay_i); 
                curr_index = notestoplay_i;
                notestoplay_i++;
                }, i*300));
        }
    }

    
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {
            console.log("player ready!");

            $(".enter-number-button").click(function() {

                // get the number
                var number_entered = $(".enter-number-text").val();
                
                var recentsasstring = $(".recent").html();
                var datavar = {
                    'username': 'anon',
                    'num': number_entered,
                };
                
                // send the AJAX request
                $.ajax({
                    url: '/enter_number',
                    data: datavar,
                    type: 'POST',
                    success: function(data) {
                        
                        // clear text
                        $(".enter-number-text").val("");
                        
                        // show entered number
                        $(".entered-number").text(data);
                        
                        // reload recent numbers
                        $(".recent").fadeOut(800, function() {
                            recentsasstring = ' <br> ' + datavar['username'] + ' played ' + datavar['num'] + recentsasstring;
                            console.log(recentsasstring);
                            $(".recent").html(recentsasstring);
                        });
                        $(".recent").fadeIn().delay(2000);
                            
                        //update current number    
                        current = data;
                        // play the number
                        play_num(data);
                        
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }

                });
            });
            
            $(".play").click(function(){
                if (paused === false){
                    play_num(current);
                } else {
                    play_num(current.slice(curr_index+1));
                    soundManager.resumeAll();
                }
                
            });
            $(".stop").click(function(){
                paused = false;
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
               soundManager.stopAll(); 
            });
            
            $(".pause").click(function(){
                paused = true; 
                for (var i = 0; i < timeouts.length; i++) {
                    clearTimeout(timeouts[i]);
                }
                
                //quick reset of the timer array you just cleared
                timeouts = [];
                soundManager.pauseAll();
            });

        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            console.log("soundmanager2 error");
        }
    }); 
});