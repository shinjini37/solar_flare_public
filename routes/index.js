var express = require('express');
var router = express.Router();


// Database in Memory
var db = {
    'anon': ['1234', '12224'],
    'jake': ['2222']
};

/* GET home page. */
router.get('/', function (req, res, next) {

  // Rendering the index view with the title 'Sign Up'
  res.render('index', { title: 'Numbers'});

});

/* GET userlist JSON */

router.get('/userlist', function (req, res, next) {

	// Sending the db object
	res.send(db);

});


/* POST to enter_number */
router.post('/enter_number', function (req, res, next) {

	// Catching variables passed in the form
	var userName = req.body.username;
	var userNum = req.body.num;

	// Adding the new entry to the db
	if (db[userName].length>0){
         db[userName].push(userNum);
    } else {
        db[userName] = [userNum];
    }
    
    // Sending the number entered
	res.send(userNum);

});

/* POST to deleteuser */
/*
router.post('/deleteuser', function (req, res, next) {

	// Catching variables passed in the form
	var userName = req.body.username;

	// Checking whether user is in db
	if (userName in db) {

		// If yes, user is deleted from db
		delete db[userName]
		res.redirect('/');	
	} else {

		// If not, error message is rendered
		var err = {
			message: "User not found",
		};
		res.render('error', err);
	}
});
*/

module.exports = router;
