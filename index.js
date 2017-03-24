'use strict';
var express = require('express')
	, logger = require('morgan')
	, app = express();
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var mysql = require('mysql');
var mysql_info = require('../../mysql.js');
var connection = mysql.createConnection(mysql_info.info());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
/* Create Salt */
var genRandomString = function (length) {
	return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};
/* Hash password with sha512 */
var sha512 = function (password, salt) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt: salt
		, passwordHash: value
	};
};
/* Generate hash for storage in database */
function saltHashPassword(userpassword) {
	var salt = genRandomString(16); //Gives salt of length 16
	var passwordData = sha512(userpassword, salt);
	console.log('UserPassword = ' + userpassword);
	console.log('Passwordhash = ' + passwordData.passwordHash);
	console.log('nSalt = ' + passwordData.salt);
	return passwordData;
}

function checkHashPassword(pass, salt) {
	var passwordData = sha512(pass, salt);
	return passwordData.passwordHash;
}
saltHashPassword('MYPASSWORD');
/* MYSQL server */
connection.connect(function (err) {
	//connected (unless 'err' is set
	console.log('connection err ' + err);
});
/* Server */
app.get('/investorsreport', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/investorsreport/css/style.css', function (req, res) {
	res.sendFile(__dirname + '/public/css/style.css');
});
app.post('/investorsreport', function (req, res) {
	console.log("POST");
	if (req.body.username == '' || req.body.password == '') {
		res.redirect('back');
		console.log("Fields cannot be null");
	} else {
		var user = req.body.username;
		var pass = req.body.password;
		connection.query('SELECT pass, salt from users where user = ?', user, function(err, result) {
			if(err) {
			} else {
				var resultPass = result[0].pass;
				var resultSalt = result[0].salt;
				var passD = checkHashPassword(pass, resultSalt);
				if (passD == resultPass) {
					console.log('Success');
				} else {
					console.log('Unsuccessful');
				}
			}
		});
		res.sendFile(__dirname + '/public/index.html');
	}
});
app.listen(process.env.PORT || 3001, function () {
	console.log('Listening on port' + (process.env.PORT || 3001))
});
