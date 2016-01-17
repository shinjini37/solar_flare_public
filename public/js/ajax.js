$(document).ready(function() {

  $(".enter-number-button").click(function() {

    // get the number
    var number_entered = $(".enter-number-text").val();
    var recentsasstring = $(".recent").html();
    console.log("foo");
    console.log(recentsasstring);
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
