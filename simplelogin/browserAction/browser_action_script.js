
let BASPort = browser.runtime.connect({
  name: "BASConnection"
});
console.log(BASPort);
form = document.querySelector("#login-form");
//console.log(form);

document.querySelector("#inpbtn").addEventListener('click', (e)=> {
  //console.log(form);
  //console.log(document.querySelector("#username").value + ", " + document.querySelector("#password").value);

  var postReq = BASPort.postMessage({
    event: "login",
    data: {
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value
    }
  });
});

function reqListener () {
  console.log(this.responseText);
}





/*
form.addEventListener('submit', (e)=> {
  /*
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", "https://acbd22a1ed468afbe36d2a1bb1780d5d.m.pipedream.net");
  oReq.send();



  let postReq = BASPort.postMessage({

  });



});
*/
