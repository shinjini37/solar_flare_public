$(document).ready(function() {
  $(".profile-main.users").css("display", "none");   
      
  $('.profile-button').click(function(){
    $.ajax({
      url: '/get_username',
      data: {},
      type: 'GET',
      success: function(username) {
        window.location = "/profile/"+username;    
      },
      error: function() {
          alert("Sorry, there was an error...");
      }
    });
      
  });
    
    
    $(".add-user-fav").click(function(){
        var fav_username = $(this).data('username');
        console.log(fav_username);
        $.ajax({
            url: '/add_fav_user',
            data: {fav_username: fav_username},
            type: 'POST',
            success: function(already_in) {
                if (!already_in){
                    console.log("29");
                    //location.reload();
                    $(".add-user-fav").text("Remove " + fav_username + "from my favorites!");
                    //alert(fav_username + " has been added to your favorites!");
                }else{
                    console.log("34");
                    //location.reload();
                    $(".add-user-fav").text("Add " + fav_username + "to my favorites!");

                }
            },
            error: function() {
                alert("Sorry, there was an error...");
                console.log("error in add user as favorite");
            }
            
        });
    });
    
    
    $(".save-public").click(function(){
        var checks = $(".is_public");
        var change= {};  
        $(checks).attr('disabled', true); 
        $(".save-public").text("Saving..."); 
        $(".save-public").attr('disabled', true);
        $(".cancel-public").attr('disabled', true);        
        for(var i = 0; i<checks.length; i++){
            var num = $(checks[i]).data('num');
            var player = $(checks[i]).data('username');
            var new_vis = $(checks[i]).is(':checked');
            console.log(new_vis);
            change[i] = ({num: num, player: player, visible:new_vis});
        }
        var data = {change: JSON.stringify(change)};
        $.ajax({
            url: '/update_visible',
            data: data,
            type: 'POST',
            success: function(data) {
                $(".save-public").text("Save");
                $(checks).attr('disabled', false); 
                $(".save-public").attr('disabled', false);
                 $(".cancel-public").attr('disabled', false); 
            },
            error: function() {
                alert("Sorry, there was an error...");
                $(".save-public").text("Save");
                $(checks).attr('disabled', false); 
                console.log("error in update user");
            }
            
        });
    });
    
    $(".cancel-public").click(function(){
        var checks = $(".is_public");
        for(var i = 0; i<checks.length; i++){
            if ($(checks[i]).data('visibility')){
                $(checks[i]).prop('checked', true);  
            } 
            if (!$(checks[i]).data('visibility')){
                $(checks[i]).prop('checked', false);                
            }
        }
    });
    
    $(".fav-numbers").click(function(){
       $(".profile-main.users").css("display", "none");       
       $(".profile-main.numbers").css("display", "block"); 
    });
        
    $(".fav-users").click(function(){
       $(".profile-main.numbers").css("display", "none");
       $(".profile-main.users").css("display", "block"); 
    });
    
});