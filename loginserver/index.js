var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var port = 3000;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'nodeuser',
	password : 'Nodeserver420!',
	database : 'nodelogin'
});

const app = express();

app.use(session({
	secret: 'HEAVENORHELL',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static('css'));


//REQUEST AND RESPONSE DUHHHHH

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
