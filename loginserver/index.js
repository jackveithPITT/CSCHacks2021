const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const path = require('path');

const port = 3000;
const WSPort = 80;




const wss = new WebSocket.Server({ port: WSPort });

let sockets = [];

wss.on('connection', function connection(ws) {
	sockets.push(ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');

	ws.on('close', function() {
    sockets = sockets.filter(s => s !== ws);
	});
});



const sqlconnection = mysql.createConnection({
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

// Add Access Control Allow Origin headers
/*app.use((req, res, next) => {
  //res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});*/


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

app.get('/test', function(req, res) {
	console.log("recieved req on test path.");
	res.send("asd?");
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
});
