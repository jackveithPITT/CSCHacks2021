const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { MongoClient } = require("mongodb");
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const path = require('path');
const https = require('https');

const port = 80;
const WSPort = 80;

const saltRounds = 9;


const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem'),
	passphrase: "SSLphraseLOL420!"
};


let sockets = [];


const mongoURI = "";

const mclient = new MongoClient(mongoURI);


async function run() {

    try {
        await mclient.connect();
        console.log("Connected correctly to server");



    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await mclient.close();
    }

}

//run().catch(console.dir);

async function runLoginQuery(type, username, password, email = null) {
  if (type === "GET") {
    try {
        await mclient.connect();
        console.log("Connected correctly to server");

        let db = mclient.db("Auth");
        let users = db.collection("Users");

        let query = { username: username };
        let options = { projection: { _id: 0, username: 1, password: 1 }};

        let userFromDB = await users.findOne(query, options);
        if (userFromDB == null) {
          throw "Username does not exist";
        }
        let passFromDB = userFromDB.password;
        console.log(userFromDB);

        bcrypt.compare(password, passFromDB).then(function(result) {
          if (result === true) {
            console.log("passwords match");
            return true;
          } else {
            console.log("passwords do not match!");
            return false;
          }
        });

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await mclient.close();
    }
  }

  else if (type == "POST") {
    try {
        await mclient.connect();
        console.log("Connected correctly to server");

        let db = mclient.db("Auth");
        let users = db.collection("Users");

        if (email == null) {
          email = "peped@gxgahs.org";
        }

        let hash = await bcrypt.hash(password, saltRounds);
        let newUser = { username: username, password: hash, email: email };

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await mclient.close();
    }
  }


}

async function postNewUser(username, password, email) {
  try {
      await mclient.connect();
      console.log("Connected correctly to server");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      if (email == null) {
        email = "peped@gxgahs.org";
      }

      let uuid = crypto.randomUUID();

      let hash = await bcrypt.hash(password, saltRounds);
      let newUser = { uuid: uuid, username: username, password: hash, email: email };

  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
  }

}
//runLoginQuery("POST", "postTest", "postPass").then(runLoginQuery("GET", "postTest", "postPass"));
runLoginQuery("GET", "postTest", "postPass");

async function getUUID(username) {
  try {
      await mclient.connect();
      console.log("Connected correctly to server");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      let query = { "username": username };
      console.log(query);
      let options = { "projection": { "_id": 0, "uuid": 1 }};
      let uuid = await users.findOne(query, options);
      //uuid = uuid.uuid;

      return uuid || null;

  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
  }
}

const app = express();
const server = https.createServer(options, app);

const wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws) {
	sockets.push(ws);
  ws.on('message', function incoming(message) {
    //console.log('received: %s', message);
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
	saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    dbName: 'Sessions'
  })
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

  let username = req.body.username;
	let password = req.body.password;
  let uuid = null;

  if (!req.session.uuid) {
  uuid = getUUID(username);
  req.session.uuid = uuid;
  }
  console.log(req.session.uuid);

	if(req.session.loggedin) {

    res.json({ "loggedin": true,
      "uuid": req.session.uuid,
      "username": req.session.username,
      "message": "successful autologin on auth"});


  }

	else if (username && password) {
		console.log(username + ", " + password);

    if (runLoginQuery("GET", username, password)) {
      req.session.loggedin = true;
      req.session.username = username;

      //TODO: fix getting the UUID (returns null or something because async (probably))
      req.session.uuid = getUUID(username);

      res.json({ "loggedin": true,
        "uuid": req.session.uuid,
        "username": req.session.username,
        "message": "successful login on auth"});
    }

	} else {
		res.json({ "loggedin": false,
      "message":'Please enter Username and Password!'});
		res.end();
	}
});

app.get('/test', function(req, res) {
	/*console.log("recieved req on test path.");
	res.send("asd?");*/


	res.json({message: "res json on test"});
});

server.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`)
});
