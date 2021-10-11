
function reqListener () {
  console.log(this.responseText);
}


form = document.querySelector("#login-form");



form.addEventListener('submit', (e)=> {
  /*
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", "https://acbd22a1ed468afbe36d2a1bb1780d5d.m.pipedream.net");
  oReq.send();


  const myHeaders = new Headers();
  myHeaders.append('Access-Control-Allow-Origin','*');
  console.log(myHeaders);

  const myRequest = new Request('http://localhost:3000/test', {
    method: 'GET',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
  });*/

  const myRequest = new Request('http://localhost:3000/test');




  fetch(myRequest)
  .then(response => response.json())
  .then(data => console.log(data));



});
