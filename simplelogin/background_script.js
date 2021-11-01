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

///////////////////////////////////////////////////////////////////////////////
//websocket shit

browser.runtime.onConnect.addListener(connected);

//client sending request
function wrapper() {
  client.send(JSON.stringify({
    "msg":"coolgug"
  }));
}



let client = new WebSocket(`wss://localhost:${WSPort}/test`);

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

    ports['BAS'].postMessage({
      "event": "PKMNPostSuccess",
      "data": {
        "uuid": session.uuid,
        "pokemon": userpkmn
      }
    });
  }


});

function connected (p) {
  if (p.name === "BAS") {
    ports[p.name] = p;
    ports[p.name].onMessage.addListener(handleBASMessage);

    //console.log("port added");
  }

  else if (p.name === "CS") {

  }
}






///////////////////////////////////////////////////////////////////////////////
//connection to Browser Script




function handleBASMessage(message, sender) {

  let ev = message.event;

  if (ev === "autologin") {
    message.data.username = session.username;
    message.data.uuid = session.uuid;
    attemptLogin(message, sender);

  }



  else if (ev === "login") {
    attemptLogin({
      "event": "login",
      "data": {
        "username": message.data.username,
        "password": message.data.password
      }
    }, sender);
  }

  else if (ev === "signup") {
    attemptSignup(
      message.data.username,
      message.data.password,
      message.data.email
    );
  }

  else if (ev === "PKMNAccess") {

    client.send(JSON.stringify({
      "event":"PKMNAccess",
      "data": {
        "uuid": session.uuid
      }
    }));
  }

  else if (ev === "PKMNEncounter") {
    console.log("encounter!");

    let pkmndex = Math.floor((Math.random() * 151) + 1);

    client.send(JSON.stringify({
      "event": "PKMNPost",
      "data": {
        "uuid": session.uuid,
        "pokemon": pkmndex
      }
    }));
  }





}

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


  fetch(loginRequest)
    .then(response => response.json())
    .then(message => {

      //console.log(message);
      if (message.loggedin) {
        session.loggedin = true;

        if (message.data.uuid && message.data.username) {
          session.uuid = message.data.uuid;
          console.log(session.uuid);
          session.username = message.data.username;

        }

        //console.log(ports);

        ports['BAS'].postMessage({
          "event": "loginsuccess",
          "data": {
            "username": session.username,
            "uuid": session.uuid
          }
        });
      }


    });


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

  fetch(signupRequest)
    .then(response => response.json())
    .then(message => {

      //console.log(message);
      if (message.event === "signupsuccess") {
        session.loggedin = true;

        if (message.data.uuid && message.data.username) {
          session.uuid = message.uuid;
          session.username = message.username;

        }

        ports['BAS'].postMessage({
          "event": "signupsuccess",
          "data": {
            "username": session.username,
            "uuid": session.uuid

          }
        });
      }

      else {
        ports['BAS'].postMessage({
          "event": "signupfailure",
          "data": {
            "error": message.data.error
          }
        });
      }




    });

}
