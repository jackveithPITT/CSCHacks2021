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
	"secret": 'HEAVENORHELL',
	"resave": true,
	"saveUninitialized": true,
  "cookie": {
    "maxAge": 1000 * 60 * 60 * 24 //60 seconds by 60 minutes by 24 hours by 1000 ms
  },
  "unset": "destroy",
  "rolling": true,
  "store": MongoStore.create({
    "mongoUrl": mongoURI,
    "dbName": 'Sessions'
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

      db = mclient.db("userData");
      let pkmn = db.collection("pkmn");
      let pkmnObject = { "uuid": uuid, "pokemon": [] };

      await pkmn.insertOne(pkmnObject);

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

async function postCurrency(uuid, currency, value) {
  let userObject = null;
  let retval = true;
  try {
      await mclient.connect();
      console.log("Connected correctly to server to post currency data");

      let db = mclient.db("userData");
      let curr = db.collection("currency");

      let query =  { "uuid": uuid };
      let options = {"projection": { "_id": 0, "uuid": 0 }};

      let userObject = await curr.findOne(query, options);
      console.log(userObject);

      if (currency === "watts") {
        userObject.watts += value;
        if (!(userObject.watts < 0)) {
          let newvalues = {"$set": {"watts": userObject.watts}};
          await curr.updateOne(query, newvalues);

        }
        else {
          retval = false;
        }
      }


  } catch (err) {
      console.log(err.stack);
  }
  finally {
      await mclient.close();
      return retval;
  }
}

async function getCurrency(uuid) {
    let currency = null;

    try {
        await mclient.connect();
        console.log("Connected correctly to server for get currency");

        let db = mclient.db("userData");
        let curr = db.collection("currency");

        let query =  { "uuid": uuid };
        let options = {"projection": { "_id": 0, "uuid": 0 }};
        currency = await curr.findOne(query, options);
        console.log(currency);


    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await mclient.close();
        console.log(currency);
        return currency;
    }
}


//WEBSOCKETS
const wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws) {
	sockets.push(ws);

  ws.send(JSON.stringify({
    "event": "connectionsuccess"
  }));


  /////////////////////////////////////////////////////////////////////////////
  //websocket event handlers
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

      if(await postPKMNtoUUID(uuid, pokemon)) {
        let pokemonarray = await getUserPKMN(uuid);
        ws.send(JSON.stringify({
          "event": "PKMNPostSuccess",
          "data": pokemonarray
        }));
      }

    }

    else if (message.event === "getCurrency") {
      console.log("getCurrency");
      let curr = await getCurrency(message.data.uuid);
      console.log(curr);
      ws.send(JSON.stringify({
        "event": "getCurrencySuccess",
        "data": {
          "currency": curr
        }
      }));

    }

    else if (message.event === "postCurrency") {
      console.log("postCurrency");
      if (await postCurrency(message.data.uuid, message.data.currency, message.data.value)) {
        ws.send(JSON.stringify({
          "event": "postCurrencySuccess",
          "data": {

          }
        }));
      }
      else {
        ws.send(JSON.stringify({
          "event": "postCurrencyFailure",
          "data": {

          }
        }));
      }
    }

    else if (message.event === "postEncounterPayment") {
      if (await postCurrency(message.data.uuid, message.data.currency, message.data.value)) {
        ws.send(JSON.stringify({
          "event": "postEncounterPaymentSuccess",
          "data": {

          }
        }));
      }
      else {
        ws.send(JSON.stringify({
          "event": "postEncounterPaymentFailure",
          "data": {

          }
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

//APP ROUTES
app.post('/signup', async function(req, res) {

  let username = req.body.data.username;
  let password = req.body.data.password;
  let email    = req.body.data.email;

  if(await isUserTaken(username) == null) {
    let userObject = await postNewUser(username, password, email);
    let uuid = await getUUIDbyUsername(username);
    await postPKMNtoUUID(uuid, {
      "pokedex_number": 24,
      "name": pokemondata[24].name,
      "nickname": pokemondata[24].name
    });

    req.session.loggedin = true;
    req.session.username = username;
    req.session.uuid = uuid;
    res.json({
      "event": "signupSuccess",
      "data": {
        "loggedin": true,
        "username": username,
        "uuid": userObject.uuid
      }
    });
  }
  else {
    req.session.loggedin = false;
    res.json({
      "event": "signupFailure",
      "data": {
        "error": "username already exists!"
      }
    });
  }
});



app.post('/auth', async function(req, res) {

  if (req.body.event === "logout") {
    req.session.loggedin = false;
    res.json({
      "event": "logoutSuccess",
      "data": {
        "message": "successful logout on auth",
        "loggedin": false
      }
    });
  }

  let username = req.body.data.username;
	let password = req.body.data.password;
  let uuid = null;

  console.log(req.session);
  //if the session is already logged in (i.e. credentials have been previously
  // provided and the session has not been destroyed) then simply autolog.
	if(req.session.loggedin == true) {
    req.session.loggedin = true;
    res.json({
      "event": "loginSuccess",
      "data": {
        "message": "successful autologin on auth",
        "loggedin": true,
        "username": req.session.username,
        "uuid": req.session.uuid
      }
    });

  }

  //check if session has attempted a login  previously; if loggedin == null
  //then it hasnt and thus is a new autologin. set loggedin to false to allow
  //future log in attempts with credentials.
  else if (req.session.loggedin == null) {
    req.session.loggedin = false;
    res.json({
      "event": "loginFailure",
      "data": {
        "loggedin": false
        //"error": "session logged out"
      }
    });
  }

  //arbitrary check as any existing session with loggedin == false will be a
  //login attempt with existing credentials guaranteed by the client.
	else if (username && password) {
    let valid = await runLoginQuery(username, password);
    //console.log(await runLoginQuery(username, password));

    if (await runLoginQuery(username, password)) {
      req.session.loggedin = true;
      req.session.username = username;

      //TODO: fix getting the UUID (returns null or something because async (probably))
      req.session.uuid = await getUUIDbyUsername(username);

      res.json({
        "event": "loginSuccess",
        "data": {
          "loggedin": true,
          "message": "successful login on auth",
          "username": req.session.username,
          "uuid": req.session.uuid
        }
      });

    } else {
      req.session.loggedin = false;
      res.json({
        "event": "loginFailure",
        "data": {
          "loggedin": false,
          "error":'incorrect username or password.'
        }
      });
    }

  //this should never be reached, but exists just in case I guess. catches a null
  //username or password.
	} else {
    req.loggedin = false;
		res.json({
      "event": "loginFailure",
      "data": {
        "loggedin": false
        //"error":'null username or password.'
      }

    });
		res.end();
	}
});

app.get('/test', function(req, res) {
	console.log("recieved req on test path.");
	res.json({message: "res json on test"});
});

server.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`)
});
