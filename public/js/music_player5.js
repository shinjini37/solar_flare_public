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
    
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var len = notestoplay_string.length;
        var last = soundManager.createSound({
                        url: sounds[notestoplay_string[len-1]]
                    });
        var nextnote= last;
        var currnote;
        var notestoplay_music = [last];
        var notestoplay_i = 1; // to prevent same note playing again
        for (var i = 1; i< notestoplay_string.length; i++){
            currnote = soundManager.createSound({
                            url: sounds[notestoplay_string[len-1-i]],
                            onplay: function(){

                                timeouts.push(setTimeout(function(){
                                    notestoplay_music[len-1 - notestoplay_i].play(); 
                                    notestoplay_i++;
                                    }, 300));

                            }
                        });
            notestoplay_music.push(currnote);
            nextnote = currnote;
        }
        notestoplay_music[len-1].play();
    }
       
    soundManager.setup({
        url: '/soundmanager2/sfw',
        onready: function() {
            console.log("player ready!");

            $(".enter-number-button").click(function() {

                // get the number
                var number_entered = $(".enter-number-text").val();
                // send the AJAX request
                $.ajax({
                    url: '/enter_number',
                    data: {
                        'username': 'anon',
                        'num': number_entered,
                    },
                    type: 'POST',
                    success: function(data) {
                        
                        // clear text
                        $(".enter-number-text").val("");
                        
                        // show entered number
                        $(".entered-number").text(data);
                        current = data;
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