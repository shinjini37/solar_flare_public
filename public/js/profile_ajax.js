$(document).ready(function() {
    
    
    $(".add-user-fav").click(function(){
        var fav_username = $(this).data('username');
        $.ajax({
            url: '/add_fav_user',
            data: {fav_username: fav_username},
            type: 'POST',
            success: function(data) {
            },
            error: function() {
                console.log("not signed in?");
            }
            
        });
    });
    
    
    
});