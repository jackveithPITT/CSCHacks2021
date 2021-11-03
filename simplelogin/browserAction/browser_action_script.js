
//connect to BAS for this popup session

let pokemon = [];

let uuid = null;


let BASPort = browser.runtime.connect({
  "name": "BAS"
});

BASPort.onMessage.addListener(handleBSMessage);
//console.log(BASPort);

//when the page gets loaded attempt an autologin
document.addEventListener('DOMContentLoaded', function(event) {
  console.log("dom");
  var postReq = BASPort.postMessage({
    "event": "autologin",
    "data": {}
  });


});

let frames = {
  loginFrame:  document.querySelector('#loginFrame'),
  signupFrame: document.querySelector('#signupFrame'),
  homeFrame: document.querySelector('#homeFrame'),
  boxFrame: document.querySelector('#boxFrame'),
  loadingFrame: document.querySelector('#loadingFrame')
}
let loginFrameDocument = loginFrame.contentWindow.document;
loginFrame.onload = () => {

  //not sure if this is necessary. in fact i believe it isnt but im not sure
  //so i dont want to remove it but i believe that all the frames might load in simultaneously
  //so checking one is like checking all of them

  loginFrameDocument = loginFrame.contentWindow.document;
  signupFrameDocument = signupFrame.contentWindow.document;
  homeFrameDocument = homeFrame.contentWindow.document;
  boxFrameDocument = boxFrame.contentWindow.document;
  loadingFrameDocument = loadingFrame.contentWindow.document;


  //////////////////////////////////////////////////////////////////////////////
  //LOGINFRAME

  //console.log(loginFrameDocument.querySelector('#logininpbtn'));
  loginFrameDocument.querySelector('.underlined').addEventListener('click', function (event) {
    swapFrames(signupFrame, loginFrame);
    loginFrameDocument.querySelector('.autherror').textContent = "";
  });

  loginFrameDocument.querySelector("#logininpbtn").addEventListener('click', (e)=> {

    var postReq = BASPort.postMessage({
      "event": "login",
      "data": {
        username: loginFrameDocument.querySelector("#loginusername").value,
        password: loginFrameDocument.querySelector("#loginpassword").value
      }
    });

    //loginFrameDocument.querySelector("#loginusername").value = "";
    loginFrameDocument.querySelector("#loginpassword").value = "";

    swapFrames(loadingFrame, loginFrame);

  });

  //////////////////////////////////////////////////////////////////////////////
  //SIGNUPFRAME
  signupFrameDocument.querySelector(".underlined").addEventListener('click', function (event) {
    swapFrames(loginFrame, signupFrame);
    signupFrameDocument.querySelector('.autherror').textContent = "";
  });
  signupFrameDocument.querySelector("#signupbtn").addEventListener('click', function (event) {

    let signupUsername = signupFrameDocument.querySelector("#signupusername").value;
    let signupPassword = signupFrameDocument.querySelector("#signuppassword").value;
    let signupEmail    = signupFrameDocument.querySelector("#signupemail")   .value;


    BASPort.postMessage({
      "event": "signup",
      "data": {
        "username": signupUsername,
        "password": signupPassword,
        "email":    signupEmail
      }
    });
    swapFrames(loadingFrame, signupFrame);


  });




  //////////////////////////////////////////////////////////////////////////////
  //HOMEFRAME

  homeFrameDocument.querySelector(".boxbutton").addEventListener('click', function (event) {
    swapFrames(boxFrame, homeFrame);

  });

  homeFrameDocument.querySelector(".catchbutton").addEventListener('click', function (event) {
    BASPort.postMessage({
      "event": "PKMNEncounter",
      "data": {

      }
    });



  });

  //////////////////////////////////////////////////////////////////////////////
  //BOXFRAME
  boxFrameDocument.querySelector(".homebutton").addEventListener('click', function (event) {
    swapFrames(homeFrame, boxFrame);

  });

  boxFrameDocument.querySelector(".catchbutton").addEventListener('click', function (event) {
    swapFrames(loadingFrame, boxFrame);

    BASPort.postMessage({
      "event": "logout",
      "data": {}
    });

  });

  //////////////////////////////////////////////////////////////////////////////
  //CATCHFRAME


};
//end off onload function event listeners



function swapFrames(frame1, frame2) {
  frame1.hidden = false;
  frame2.hidden = true;
}

function handleBSMessage(message, sender) {

  let ev = message.event;

  if (ev === "loginSuccess") {

    username = message.data.username;
    homeFrameDocument.querySelector("#homeusername").textContent = username;

    BASPort.postMessage({
      event: "PKMNAccess",
      data: {
      }
    });

    //swapFrames(homeFrame, loginFrame);
  }

  else if (ev === "loginFailure") {
    if (message.data.error) {
      console.log("login failure. error: " + message.data.error);
      loginFrameDocument.querySelector(".autherror").textContent = message.data.error;
    }

    swapFrames(loginFrame, loadingFrame);
  }

  else if (ev === "signupSuccess") {
    console.log(message);
    username = message.data.username;
    homeFrameDocument.querySelector("#homeusername").textContent = username;

    BASPort.postMessage({
      event: "PKMNAccess",
      data: {
      }
    });

    //swapFrames(homeFrame, loadingFrame);

  }

  else if (ev === "signupFailure") {
    if (message.data.error) {
      console.log("signup failure. error: " + message.data.error);
      signupFrameDocument.querySelector(".autherror").textContent = message.data.error;
    }
    swapFrames(signupFrame, loadingFrame);
  }

  else if (ev === "logoutSuccess") {
    swapFrames(loginFrame, loadingFrame);
  }

  else if (ev === "PKMNAccessSuccess") {
    pokemon = message.data.pokemon;
    console.log("hi :)");

    for (let i = 0; i < Math.min(pokemon.length, 16); i++) {
      let srcstring = "./images/" + filterPokemonName(pokemon[i].name) + "-icon.png";
      boxFrameDocument.querySelector(`#box${i}`).src = srcstring;
    }

    let homepokemonsrc = "./images/" + filterPokemonName(pokemon[0].name) + ".png";
    homeFrameDocument.querySelector("#homepokemon").src = homepokemonsrc;

    swapFrames(homeFrame, loadingFrame);
  }

  else if (ev === "PKMNPostSuccess") {
    pokemon = message.data.pokemon;

    for (let i = 0; i < Math.min(pokemon.length, 16); i++) {
      let srcstring = "./images/" + filterPokemonName(pokemon[i].name) + "-icon.png";
      boxFrameDocument.querySelector(`#box${i}`).src = srcstring;
    }
  }


}

function reqListener () {
  console.log(this.responseText);
}

function filterPokemonName(name) {
  name = name.toLowerCase()
  .replace("\'", "")
  .replace(".","")
  .replace( " ","-")
  .replace("♂","-m")
  .replace("♀","-f");

  return name;
}
