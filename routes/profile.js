var express = require('express');
var router = express.Router();

// Access to real DB
var db = require('../db-setup.js');


/* GET home page. */
router.get('/:username', function (req, res, next) {
        var username = req.params.username;
      // Rendering the index view with the title as the username
      res.render('profile', { title: username});
});

module.exports = router;