$(document).ready(function() {

  // update recents
  /*
  window.onload=function(){
        setInterval("my_function();",5000); 
        function my_function(){
            
            $.ajax({url: '/update_recents',
                data: {},
                type: 'GET',
                success: function(data) {
                    $('.recent').empty();
                    $('.recent').append(data);
                },
                error: function(xhr, status, error) {
                    console.log("Uh oh there was an error: " + error);
                }
                });
                
        }
  };*/
 


  $(".sign-in-button").click(function() {
    var entered_username = $(".username").val();
    var entered_password = $(".password").val();
    var entered_data = {
      'username': entered_username,
      'password': entered_password
    };

    // send the AJAX request
    $.ajax({
      url: '/signin',
      data: entered_data,
      type: 'POST',
      success: function(data) {
        if (data === true) {
          location.reload();
        } else {
          window.alert(data);
          $(".username").val('');
          $(".password").val('');
        }
      },
      error: function() {
          console.log("sign in error");
      }
    });
  });

  $(".sign-up-button").click(function(){
     $(".sign-up-box").css("display", "block"); 
  });

  $(".sign-up-button.signup").click(function() {
    var entered_username = $(".username.signup").val();
    var entered_password = $(".password.signup").val();
    var verify_password = $(".password.signup.verify").val();
    
    if (entered_username.length<4 || entered_username.length>20){
        alert("Username is too long or too short. It must be between 4-20 charecters.");
    } else if (entered_username === "anon"){
        alert("Username cannot be anon!");
        $(".username.signup").val("");
        $(".password.signup").val("");
        $(".password.signup .verify").val("");
    } else if (!(entered_password === verify_password)){
        alert("Passwords do not match.");
        $(".password.signup").val("");
        $(".password.signup .verify").val("");
    } else {    
        var entered_data = {
        'username': entered_username,
        'password': entered_password
        };

        // send the AJAX request
        $.ajax({
        url: '/signup',
        data: entered_data,
        type: 'POST',
        success: function(success) {
            location.reload();
            if (success){
            } else {
                alert("Username already exists.");
            }
            //$(".username").val('');
            //$(".password").val('');
        },
        error: function() {
        }
        });
    }
  });
  
  $(".cancel-button.signup").click(function(){
      $(".sign-up-box").css("display", "none");
  });


  $('.sign-out-button').click(function(){
    $.ajax({
      url: '/signout',
      data: {},
      type: 'POST',
      success: function(data) {
        window.location = "/";
      },
      error: function() {
      }
    });  
  });

  $(".search-button").click(function(){
     var username = $(".search-text").val();
     $.ajax({
      url: '/find_user',
      data: {username: username},
      type: 'POST',
      success: function(found) {
          if (found){
              $(".search-result").text("Found! Redirecting...");
            window.location = "/profile/"+username;
          } else {
              $(".search-result").text("User not found");
              console.log("user not found");
              
              setTimeout( function() { $(".search-result").text(""); 
                                        }, 700)
          }
      },
      error: function() {
      }
    });
         
  });


  $(".digit").click(function () {
    var current_number = $(".enter-number-text").val();
    current_number += $(this).attr("name");
    console.log($(this).attr("name"));
    console.log(current_number);
    $(".enter-number-text").val(current_number);
  });

  // clicking "enter" when in a text box triggers some buttons, obtained from
  // http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
  $(".password.signin").keyup(function(event){
    if(event.keyCode == 13){
        $(".sign-in-button").click();
    }
  });

   $(".password.signup.verify").keyup(function(event){
    if(event.keyCode == 13){
        $(".sign-up-button.signup").click();
    }
  });

  $(".enter-number-text").keyup(function(event){
    if(event.keyCode == 13){
        $(".enter-number-button").click();
    }
  });

  $(".search-text").keyup(function(event){
    if(event.keyCode == 13){
        $(".search-button").click();
    }
  });

});
