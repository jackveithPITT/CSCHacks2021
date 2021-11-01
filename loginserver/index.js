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
const crypto = require('crypto');
const pokemondata = require("./data/pokemon.json");

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

const app = express();
const server = https.createServer(options, app);

app.use(express.static('css'));
app.use(express.static('images'));
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

async function runLoginQuery(username, password) {

  retval = false;
  try {
      await mclient.connect();
      console.log("Connected correctly to server on loginquery");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      let query = { username: username };
      let options = { projection: { _id: 0, username: 1, password: 1 }};

      let userFromDB = await users.findOne(query, options);
      if (userFromDB == null) {
        throw "Username does not exist";
      }
      let passFromDB = userFromDB.password;
      //console.log(userFromDB);

      await bcrypt.compare(password, passFromDB).then(function(result) {
        if (result === true) {
          console.log("passwords match");
          retval = true;
        } else {
          console.log("passwords do not match!");
          retval = false;
        }
      });

  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
  }
  return retval;

}

async function postNewUser(username, password, email) {
  let userObject = null;
  try {
      await mclient.connect();
      console.log("Connected correctly to server to post new user");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      if (email == null) {
        email = "peped@gxgahs.org";
      }

      let uuid = crypto.randomUUID();

      let hash = await bcrypt.hash(password, saltRounds);
      userObject = { uuid: uuid, username: username, password: hash, email: email };

      await users.insertOne(userObject);

  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return userObject;
  }

}

async function getUUIDbyUsername(username) {
  let uuid = null;
  try {
      await mclient.connect();
      console.log("Connected correctly to server for uuid");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      let query = { "username": username };
      let options = { "projection": { "_id": 0, "uuid": 1 }};
      uuid = await users.findOne(query, options);
      uuid = uuid.uuid;



  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return uuid || null;
  }
  return uuid || null;
}

async function getUserPKMN(uuid) {

  let pokemon = null;

  try {
      await mclient.connect();
      console.log("Connected correctly to server for get pkmn");

      let db = mclient.db("userData");
      let pkmn = db.collection("pkmn");

      let query =  { "uuid": uuid };
      let options = {};
      let userObject = await pkmn.findOne(query, options);

      pokemon = userObject.pokemon;


  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return pokemon;
  }
}

async function isUserTaken(username) {
  try {
      await mclient.connect();
      console.log("Connected correctly to server for username");

      let db = mclient.db("Auth");
      let users = db.collection("Users");

      let query = { "username": username };
      let options = { "projection": { "_id": 0, "username": 1 }};
      username = await users.findOne(query, options);
      //uuid = uuid.uuid;



  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return username || null;
  }
  return username || null;

}

async function postPKMNtoUUID(uuid, pokemon) {
  let userObject = null;
  let retval = false;
  try {
      await mclient.connect();
      console.log("Connected correctly to server to post pkmn data");

      let db = mclient.db("userData");
      let pkmn = db.collection("pkmn");

      let query =  { "uuid": uuid };
      let options = {"projection": { "_id": 0, "uuid": 0 }};

      let userObject = await pkmn.findOne(query, options);
      console.log(userObject);
      userObject.pokemon.push(pokemon);
      let newvalues = {"$set": {"pokemon": userObject.pokemon}};
      await pkmn.updateOne(query, newvalues);
      retval = true;

  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return retval;
  }
}


//WEBSOCKETS
const wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws) {
	sockets.push(ws);

  ws.send(JSON.stringify({
    "event": "connectionsuccess"
  }));

  ws.on('message', async function (msg) {
    //console.log('received: %s', message);
    message = JSON.parse(msg);
    console.log(message);

    if (message.event === "PKMNAccess") {
      console.log("PKMNAccess");
      let uuid = message.data.uuid;

      let pokemonarray = await getUserPKMN(uuid);

      console.log(pokemonarray);

      ws.send(JSON.stringify({
        "event": "PKMNAccessSuccess",
        "data": pokemonarray
      }));

    }

    else if (message.event === "PKMNPost") {
      console.log("PKMNPost");
      let uuid = message.data.uuid;
      let pkmndex = message.data.pokemon;

      let pokemon = {
        "pokedex_number": pkmndex,
        "name": pokemondata[pkmndex].name,
        "nickname": pokemondata[pkmndex].name
      }

      if(postPKMNtoUUID(uuid, pokemon)) {
        let pokemonarray = await getUserPKMN(uuid);
        ws.send(JSON.stringify({
          "event": "PKMNPostSuccess",
          "data": pokemonarray
        }));
      }

    }





  });

	ws.on('close', function() {
    sockets = sockets.filter(s => s !== ws);
	});
});


function sendWSError(ws, error) {
  ws.send(JSON.stringify({
    "event": "error",
    "error": error
  }));
}




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

app.post('/signup', async function(req, res) {

  let username = req.body.data.username;
  let password = req.body.data.password;
  let email    = req.body.data.email;

  if(await isUserTaken(username) == null) {
    let userObject = await postNewUser(username, password, email);

    res.json({
      "event": "signupsuccess",
      "loggedin": true,
      "data": {
        "username": username,
        "uuid": userObject.uuid

      }
    });
  }
  else {
    res.json({
      "event": "signupfailure",
      "data": {
        "error": "username already exists!"
      }
    });
  }





});



app.post('/auth', async function(req, res) {

  let username = req.body.data.username;
	let password = req.body.data.password;
  let uuid = null;

  //change this back! dont not (!)
	if(req.session.loggedin) {

    res.json({
      "message": "successful autologin on auth",
      "loggedin": true,
      "data": {
        "username": req.session.username,
        "uuid": req.session.uuid
      }

    });


  }

	else if (username && password) {

    let valid = await runLoginQuery(username, password);
    //console.log(await runLoginQuery(username, password));

    if (await runLoginQuery(username, password)) {
      req.session.loggedin = true;
      req.session.username = username;

      //TODO: fix getting the UUID (returns null or something because async (probably))
      req.session.uuid = await getUUIDbyUsername(username);

      res.json({ "loggedin": true,
        "data": {
          "username": req.session.username,
          "uuid": req.session.uuid
        },
        "message": "successful login on auth"
      });
    } else {
      res.json({ "loggedin": false,
        "message":'Incorrect Credentials!'
      });
    }

	} else {
		res.json({ "loggedin": false,
      "message":'Please enter Username and Password!'
    });
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
