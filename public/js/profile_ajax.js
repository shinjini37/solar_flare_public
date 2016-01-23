$(document).ready(function() {
    
      
  $('.profile-button').click(function(){
    $.ajax({
      url: '/get_username',
      data: {},
      type: 'GET',
      success: function(username) {
        window.location = "/profile/"+username;    
      },
      error: function() {
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
                    location.reload();
                    //alert(fav_username + " has been added to your favorites!");
                }else{
                    alert(fav_username+" is aleady in your favorites!");
                }
            },
            error: function() {
                console.log("error in add user as favorite");
            }
            
        });
    });
    
    
    
});