var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var port = 3000;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Shagg@008080',
	database : 'nodelogin'
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.send("peped");
});

app.post("/login", (req, res) => {
	
	res.end("hi");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
