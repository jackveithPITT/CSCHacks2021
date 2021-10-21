const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { MongoClient } = require("mongodb");
const path = require('path');
const https = require('https');

const port = 80;
const WSPort = 80;


const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem'),
	passphrase: "SSLphraseLOL420!"
};


let sockets = [];


const mongoURI = "mongodb+srv://nodeServerUser:NodeserverLOL420!@pkmncluster.izgjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const mclient = new MongoClient(mongoURI);









const app = express();

const server = https.createServer(options, app);

const wss = new WebSocket.Server({ server: server });

const sqlconnection = mysql.createConnection({
	host     : 'localhost',
	user     : 'nodeuser',
	password : 'Nodeserver420!',
	database : 'nodelogin'
});




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







app.use(express.static('css'));

app.use(session({
	secret: 'HEAVENORHELL',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



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
	console.log(req);
	let username = req.body.username;
	let password = req.body.password;
	if (username && password) {
		console.log(username + ", " + password);
		sqlconnection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;

				res.json({message: "res json on auth"});
				//res.redirect('/home');
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
	/*console.log("recieved req on test path.");
	res.send("asd?");*/
	res.json({message: "res json on test"});
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

server.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`)
});
