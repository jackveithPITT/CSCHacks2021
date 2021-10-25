// Put all the javascript code here, that you want to execute in background.

const port = 80;
const WSPort = 80;

let ports = {};
let session = {
  "loggedin": false,
  "uuid": false,
  "username": ""
};


///////////////////////////////////////////////////////////////////////////////
//websocket shit

browser.runtime.onConnect.addListener(connected);





let client = new WebSocket(`wss://localhost:${WSPort}/test`);

client.addEventListener('message', msg => {
  //console.log(msg);
  client.send("websocket uplink est.");
});

function connected (p) {
  if (p.name === "BASConnection") {
    ports[p.name] = p;
    ports[p.name].onMessage.addListener(handleBASMessage);
    //console.log("port added");
  }
}






///////////////////////////////////////////////////////////////////////////////
//connection to Browser Script




function handleBASMessage(message, sender) {

  let ev = message.event;

  if (ev === "autologin") {
    attemptLogin(message, sender);

  }



  if (ev === "login") {
    attemptLogin(message, sender);
  }



}

function attemptLogin(message, sender) {
  //console.log(message.data);
  const myRequest = new Request(`https://localhost:${port}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(message.data)
  });


  fetch(myRequest)
    .then(response => response.json())
    .then(data => {

      //console.log(data);
      if (data.loggedin) {
        session.loggedin = true;
        console.log(data);
        if (data.uuid && data.username) {
          session.uuid = data.uuid;
          session.username = data.username;
        }

        //console.log(ports);

        ports['BASConnection'].postMessage({
          "event": "loginsuccess",
          "data": { "username": session.username }
        });
      }


    });


}
