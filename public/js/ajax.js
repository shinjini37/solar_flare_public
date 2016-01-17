$(document).ready(function() {
  
  
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

    // send the AJAX request
    $.ajax({
      url: '/signin',
      data: entered_data,
      type: 'POST',
      success: function(data) {
        console.log(data);
      },
      error: function() {
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
