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
    
    var play_num = function(notestoplay_string){
        console.log("in play_num");
        var len = notestoplay_string.length;
        var notestoplay_music = [];
        var notestoplay_i = 1; // to prevent same note playing again
        for (var i = 0; i< notestoplay_string.length; i++){
            var currnote = soundManager.createSound({
                            url: sounds[notestoplay_string[i]]
                            });
            notestoplay_music.push(currnote);
        }
        for (var i = 0; i< notestoplay_string.length; i++){
            notestoplay_music[i].onPosition(300, function(eventPosition){
                                    notestoplay_music[notestoplay_i].play(); 
                                    notestoplay_i++;
            });
        }
        notestoplay_music[0].play();
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
                        
                        play_num(data);
                        
                    },
                    error: function(xhr, status, error) {
                        console.log("Uh oh there was an error: " + error);
                    }

                });
            });
            
            $(".play").click(function(){

                // send the AJAX request
                $.ajax({
                url: '/play',
                data: {a:'a'},
                type: 'GET',
                success: function(data) {
                    // print out data
                    play_num(data);
                },
                error: function(xhr, status, error) {
                    console.log("Uh oh there was an error: " + error);
                }
                });
            });
            $(".stop").click(function(){
               soundManager.stopAll(); 
            });

        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            console.log("soundmanager2 error");
        }
    }); 
});