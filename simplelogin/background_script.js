// Put all the javascript code here, that you want to execute in background.

const port = 3000;
const WSPort = 80;

///////////////////////////////////////////////////////////////////////////////
//websocket shit


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
  }
}
browser.runtime.onConnect.addListener(connected);

function handleBASMessage() {

}

///////////////////////////////////////////////////////////

function sendTest() {

  let myHeaders = new Headers();
  //myHeaders.append('Access-Control-Allow-Origin','*');
  //console.log(myHeaders);

  const myRequest = new Request(`http://localhost:${port}/test`, {
    method: 'GET',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
  });


  fetch(myRequest)
  .then(response => {
    console.log("achieved not Network Error!");
  })
  .then(data => console.log(data));
}

sendTest();
