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
	console.log('GET');
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/investorsreport/report.html', function(req, res) {
	res.sendFile(__dirname + '/public/report.html');
});
app.get('/investorsreport/css/style.css', function (req, res) {
	res.sendFile(__dirname + '/public/css/style.css');
});
app.get('/investorsreport/img/profile.png', function (req, res) {
	res.sendFile(__dirname + '/public/img/profile.png');
});
app.get('/investorsreport/css/main.css', function (req, res) {
	res.sendFile(__dirname + '/public/css/main.css');
});
app.get('/investorsreport/js/index.js', function (req, res) {
	res.sendFile(__dirname + '/public/js/index.js');
});
app.get('/investorsreport/mapping.json', function (req, res) {
	res.sendFile(__dirname + '/public/mapping.json');
});
app.get('/investorsreport/css/report.css', function (req, res) {
	res.sendFile(__dirname + '/public/css/report.css');
});
app.get('/investorsreport/CReport.html', function (req, res) {
	res.sendFile(__dirname + '/public/CReport.html');
});
app.get('/investorsreport/js/compare.js', function (req, res) {
	res.sendFile(__dirname + '/public/js/compare.js');
});
app.post('/investorsreport/login', function (req, res) {
	console.log("POST");
	console.log(res.body);
	if (req.body.username == '' || req.body.password == '') {
		res.redirect('back');
		console.log("Fields cannot be null");
	} else {
		console.log('Querying');
		var user = req.body.username;
		var pass = req.body.password;
		console.log(user);
		console.log(pass);
		connection.query('SELECT password, salt from users where username = ?', user, function(err, result) {
			if(err) {
				console.log("Error Querying");
				throw err;
			} else {
				console.log("Executing Query");
				if(result.length > 0) {
					var resultPass = result[0].password;
					var resultSalt = result[0].salt;
					console.log("here");
					var passD = checkHashPassword(pass, resultSalt);
					console.log(passD);
					console.log(resultPass);
					if (passD == resultPass) {
						console.log('Success');
					} else {
						console.log('Unsuccessful');
					}
				} else {
					console.log("Could not find user");
				}
			}
		});
		res.sendFile(__dirname + '/public/index.html');
	}
});
app.listen(process.env.PORT || 3001, function () {
	console.log('Listening on port' + (process.env.PORT || 3001))
});
