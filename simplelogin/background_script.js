// Put all the javascript code here, that you want to execute in background.

const port = 80;
const WSPort = 80;

let ports = {};
let session = {
  "loggedin": false,
  "uuid": "",
  "username": ""
};

let userpkmn = [];

//TODO: establish websockets only for privileged users
let client = new WebSocket(`wss://localhost:${WSPort}/test`);

////////////////////////////////////////////////////////////////////////////////
//set up script ports
browser.runtime.onConnect.addListener(connected);

function connected (p) {
  if (p.name === "BAS") {
    ports[p.name] = p;
    ports[p.name].onMessage.addListener(handleBASMessage);
  }
  else if (p.name === "CS") {
  }
}

//client sending request
function wrapper() {
  client.send(JSON.stringify({
    "msg":"coolgug"
  }));
}



////////////////////////////////////////////////////////////////////////////////
//websocket shit


client.addEventListener('message', message => {

  msg = JSON.parse(message.data);

  if (msg.event === "error") {
    console.log(msg.error);
  }

  if (msg.event === "connectionsuccess") {
    console.log("connected on websockets");
  }

  else if (msg.event === "PKMNAccessSuccess") {
    userpkmn = msg.data;

    console.log("post BAS pkmnaccesssuccess");

    ports['BAS'].postMessage({
      "event": "PKMNAccessSuccess",
      "data": {
        "uuid": session.uuid,
        "pokemon": userpkmn
      }
    });
  }

  else if (msg.event === "PKMNPostSuccess") {
    userpkmn = msg.data;

    console.log("post BAS pkmnpostsuccess");

    ports['BAS'].postMessage({
      "event": "PKMNPostSuccess",
      "data": {
        "uuid": session.uuid,
        "pokemon": userpkmn
      }
    });
  }


});








///////////////////////////////////////////////////////////////////////////////
//BrowserSCript events

function handleBASMessage(message, sender) {

  let ev = message.event;

  if (ev === "autologin") {
    message.data.username = session.username;
    message.data.uuid = session.uuid;
    attemptLogin(message, sender);

  }



  else if (ev === "login") {
    if (message.data.username.length != "" &&
        message.data.password != "") {
      attemptLogin({
        "event": "login",
        "data": {
          "username": message.data.username,
          "password": message.data.password
        }
      }, sender);
    } else {
      console.log("post BAS loginFailure");

      ports['BAS'].postMessage({
        "event": "loginFailure",
        "data": {
          "error": "invalid username or password."
        }
      });
    }
  }

  else if (ev === "signup") {
    if (message.data.username.length >= 3 &&
        message.data.password != "" &&
        message.data.email != "") {

      attemptSignup(
        message.data.username,
        message.data.password,
        message.data.email
      );
    } else {
      console.log("post BAS signupfailure");

      ports['BAS'].postMessage({
        "event": "signupFailure",
        "data": {
          "error": "invalid input. usr.length < 3?"
        }
      });

    }

  }

  else if (ev ===  "logout") {
    attemptLogout(message, sender);

  }

  else if (ev === "PKMNAccess") {

    console.log("post socket pkmnaccess");
    client.send(JSON.stringify({
      "event":"PKMNAccess",
      "data": {
        "uuid": session.uuid
      }
    }));
  }

  else if (ev === "PKMNEncounter") {
    console.log("encounter!");

    let pkmndex = Math.floor((Math.random() * 151));

    console.log("post socket pkmnpost");
    client.send(JSON.stringify({
      "event": "PKMNPost",
      "data": {
        "uuid": session.uuid,
        "pokemon": pkmndex
      }
    }));
  }
  else if (false) {}

}

function verifyWebsocket() {

  if (false) {}

}


////////////////////////////////////////////////////////////////////////////////
//helper functions

function attemptLogin(message, sender) {
  //console.log(message);
  const loginRequest = new Request(`https://localhost:${port}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(message)
  });

  console.log("post server loginattempt");
  fetch(loginRequest)
    .then(response => response.json())
    .then(message => {

      //console.log(message);
      if (message.event == "loginSuccess") {
        session.loggedin = true;

        if (message.data.uuid && message.data.username) {
          session.uuid = message.data.uuid;
          console.log(session.uuid);
          session.username = message.data.username;

        }

        //console.log(ports);
        console.log("post BAS loginsuccess");
        ports['BAS'].postMessage({
          "event": "loginSuccess",
          "data": {
            "username": session.username,
            "uuid": session.uuid
          }
        });
      }

      else {
        console.log("post BAS loginfailure");
        ports['BAS'].postMessage({
          "event": "loginFailure",
          "data": {
            "error": message.data.error
          }
      });


      }
    }
  );
}

function attemptSignup(username, password, email) {

  let signupRequest = new Request(`https://localhost:${port}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      "event": "signup",
      "data": {
        "username": username,
        "password": password,
        "email": email
      }
    })
  });

  console.log("post server attemptsignup");
  fetch(signupRequest)
    .then(response => response.json())
    .then(message => {

      //console.log(message);
      if (message.event === "signupSuccess") {
        session.loggedin = true;

        if (message.data.uuid && message.data.username) {
          session.uuid = message.uuid;
          session.username = message.username;

        }

        console.log("post BAS signupSuccess");

        ports['BAS'].postMessage({
          "event": "signupSuccess",
          "data": {
            "username": session.username,
            "uuid": session.uuid

          }
        });
      }

      else {
        console.log("post BAS signupfailure");

        ports['BAS'].postMessage({
          "event": "signupFailure",
          "data": {
            "error": message.data.error
          }
        });
      }

    });

}

function attemptLogout(message, sender) {
  //console.log(message);
  const logoutRequest = new Request(`https://localhost:${port}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(message)
  });

  console.log("post server logoutattempt");
  fetch(logoutRequest)
    .then(response => response.json())
    .then(message => {
      if (message.event === "logoutSuccess") {

        session.loggedin = false;
        ports['BAS'].postMessage({
          "event": "logoutSuccess",
          "data": {          }
        });

      }

      else {

      }


    }
  );
}
