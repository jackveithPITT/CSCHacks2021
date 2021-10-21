// Put all the javascript code here, that you want to execute in background.

const port = 80;
const WSPort = 80;

///////////////////////////////////////////////////////////////////////////////
//websocket shit
browser.runtime.onConnect.addListener(connected);

let ports = {};

let client = new WebSocket(`wss://localhost:${WSPort}/test`);

client.addEventListener('message', msg => {
  console.log(msg);
  client.send("asd?");
});








///////////////////////////////////////////////////////////////////////////////
//connection to Browser Script

function connected (p) {
  if (p.name === "BASConnection") {
    ports[p.name] = p;
    ports[p.name].onMessage.addListener(handleBASMessage);
    console.log("port added");
  }
}


function handleBASMessage(message, sender) {

  let ev = message.event;



  if (ev === "login") {

    let myHeaders = new Headers();
    //myHeaders.append('Access-Control-Allow-Origin','*');
    //console.log(myHeaders);
    console.log("cug");
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
      .then(data => console.log(data));
  }

}

///////////////////////////////////////////////////////////

function sendTest() {

  let myHeaders = new Headers();
  //myHeaders.append('Access-Control-Allow-Origin','*');
  //console.log(myHeaders);

  const myRequest = new Request(`https://localhost:${port}/auth`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default'
  });


  fetch(myRequest)
  .then(response => {
    console.log("achieved not Network Error!");
  })
  .then(data => console.log(data));
}

//sendTest();
