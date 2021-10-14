// Put all the javascript code here, that you want to execute in background.


let clients = [
  new WebSocket('ws://localhost:8080/test'),
  new WebSocket('ws://localhost:8080/test')
];

clients[0].addEventListener('message', msg => console.log(msg));


/*
clients.map(client => {
  client.on('message', msg => console.log(msg));
});*/



// Prints "Hello!" twice, once for each client.



///////////////////////////////////////////////////////////

const myRequest = new Request('http://localhost:3000/test');




function sendTest() {

  fetch(myRequest)
  .then(response => {
    console.log("achieved not Network Error!");
  })
  .then(data => console.log(data));
}

sendTest();
