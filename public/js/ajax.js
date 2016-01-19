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
 
  
  $(".test-button").click(function() {

    // send the AJAX request
    $.ajax({
      url: '/test',
      data: {},
      type: 'GET',
      success: function(data) {
        // print out data
        console.log(data);
      },
      error: function(xhr, status, error) {
        console.log("Uh oh there was an error: " + error);
      }
    });
  });

  $(".sign-in-button").click(function() {
    var entered_username = $(".username").val();
    var entered_password = $(".password").val();
    var entered_data = {
      'username': entered_username,
      'password': entered_password
    };
    console.log('sign in button clicked');
    console.log(entered_username);
    console.log(entered_password);
    // send the AJAX request
    $.ajax({
      url: '/signin',
      data: entered_data,
      type: 'POST',
      success: function(data) {
        if (data === "sign in successfully.") {
            console.log('login success');
          //$(".sign-in").replaceWith("<h2> Welcome " + '<div class="username">'+ entered_username+'</div>' + " </h2>");
          //$(".sign-up").replaceWith("<div class='sign-out'>" + " <button class='sign-out-button'>Sign Out</button>" + "</div>");
        location.reload();
        }
      },
      error: function() {
          console.log("sign in error");
      }
    });
  });

  $(".sign-up-button").click(function() {
    var entered_username = $(".username").val();
    var entered_password = $(".password").val();
    var entered_data = {
      'username': entered_username,
      'password': entered_password
    };

    // send the AJAX request
    $.ajax({
      url: '/signup',
      data: entered_data,
      type: 'POST',
      success: function(data) {
        console.log(data);
      },
      error: function() {
      }
    });
  });


  $(".login-stuff").on('click', '.sign-out-button', function(){
    $.ajax({
      url: '/signout',
      data: {},
      type: 'POST',
      success: function(data) {
        location.reload();
      },
      error: function() {
      }
    });  
  });
  /*
  $(".sign-out-button").on('click',function() {
    console.log("feeee");
    location.reload();
  });
  */
  

  /*
  $(".something").click(function() {

    // get the number
    var number_entered = $(".enter-number-text").val();

    // send the AJAX request
    $.ajax({
      url: '/enter-number',
      data: {
        number: number_entered,
      },
      type: 'GET',
      success: function(data) {
        // update the HTML element with the returned data
        $(".find-output").text(data);
      },
      error: function(xhr, status, error) {
        console.log("Uh oh there was an error: " + error);
      }
    });
  });

  $(".add-submit").click(function() {

    // get the username and fruit
    var name = $(".username-add").val();
    var fruit = $(".userfruit-add").val();

    // send the AJAX request
    $.ajax({
      url: '/adduser',
      data: {
        username: name,
        userfruit: fruit
      },
      type: 'POST',
      success: function(data) {
        // add a new list element containing the returned data
        $(".user-add").append("<li>" + data + "</li>");
      },
      error: function(xhr, status, error) {
        console.log("Uh oh there was an error: " + error);
      }
    });
  });
  */
});
