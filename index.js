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
app.set('view engine', 'ejs');
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
	//console.log('UserPassword = ' + userpassword);
	//console.log('Passwordhash = ' + passwordData.passwordHash);
	//console.log('nSalt = ' + passwordData.salt);
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
	console.log('READY');
});
/* Server */
app.get('/investorsreport', function (req, res) {
	console.log('GET');
	var user = req.query.username;
	if (!user) {
		console.log("N/E");
	res.sendFile(__dirname + '/public/index.html');
	}
	else {
		connection.query("SELECT query FROM users WHERE username = ?", user, function (error, result) {
			if (error) {
				throw error;
			}
			else {
				var query = result[0].query;
				if (query) {
				query = query.split(",");
				} else {
					query = '';
				}
				res.render('login.ejs', {
					div: query
					, user: user
				});
			}
		});
	}
});
app.get('/investorsreport/index.html', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/investorsreport/report.html', function (req, res) {
	try {
		var user = req.query.username;
		var company = req.query.company;
		console.log("Found params " + user + " " + company);
	}
	catch (e) {
		var user = '';
		var company = '';
		throw e;
	}
	if (!user || !company) {
		console.log("Params null");
	}
	else {
		console.log("UPDATING database query");
		try {
			connection.query('SELECT query FROM users WHERE username = ?', user, function (err, result) {
				if (err) throw err;
				else {
					var query = result[0].query;
					if (query) {
					query = query.split(",");
					} else {
						query = [];
					}
					console.log(query);
					company = company.toLowerCase();
					console.log(company);
					if (query.includes(company)) {
						console.log("Query already contains company");
					}
					else {
						query.push(company);
						connection.query('UPDATE users SET query=? WHERE username=?', [query.toString(), user], function (err, result) {
							if (err) {
								throw err;
							}
							else {
								console.log("Update complete");
							}
						});
					}
				}
			});
		}
		catch (e) {
			throw e;
		}
	}
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
app.get('/investorsreport/signup.html', function (req, res) {
	res.sendFile(__dirname + '/public/signup.html');
});
app.get('/investorsreport/about.html', function (req, res) {
	res.sendFile(__dirname + '/public/about.html');
});
app.get('/investorsreport/terms.html', function (req, res) {
	res.sendFile(__dirname + '/public/terms.html');
});
app.post('/investorsreport/login', function (req, res) {
	console.log("POST");
	console.log(res.body);
	if (req.body.username == '' || req.body.password == '') {
		res.redirect('back');
		console.log("Fields cannot be null");
	}
	else {
		console.log('Querying');
		var user = req.body.username;
		var pass = req.body.password;
		console.log(user);
		console.log(pass);
		connection.query('SELECT password, salt, query from users where username = ?', user, function (err, result) {
			if (err) {
				console.log("Error Querying");
				throw err;
			}
			else {
				console.log("Executing Query");
				if (result.length > 0) {
					var resultPass = result[0].password;
					var resultSalt = result[0].salt;
					console.log("here");
					var passD = checkHashPassword(pass, resultSalt);
					console.log(passD);
					console.log(resultPass);
					if (passD == resultPass) {
						console.log('Successful');
						var query = result[0].query;
						console.log("Query = " + query);
						if (query) {
							console.log("here");
							query = query.split(",");
						} else {
							console.log("there");
							query = '';
						}
						console.log("Query = " + query);
						res.render('login.ejs', {
							div: query
							, user: user
						});
						console.log("COMPLETE");
					}
					else {
						console.log('Unsuccessful');
						res.redirect('back');
					}
				}
				else {
					console.log("Could not find user");
					res.redirect('back');
				}
			}
		});
	}
});
app.post('/investorsreport/signup', function (req, res) {
	console.log("Adding to database");
	if (req.body.username == '' || req.body.password == '') {
		res.redirect('back');
		console.log("Fields cannot be null");
	}
	else {
		console.log("Inserting data");
		var user = req.body.username;
		var pass = req.body.password;
		var spass = saltHashPassword(pass);
		console.log(spass.passwordHash);
		console.log(spass.salt);
		connection.query('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', [user, spass.passwordHash, spass.salt], function (err, result) {
			if (err) {}
			else {}
		});
	}
	res.sendFile(__dirname + '/public/index.html');
});
app.listen(process.env.PORT || 3001, function () {
	console.log('Listening on port' + (process.env.PORT || 3001))
});
