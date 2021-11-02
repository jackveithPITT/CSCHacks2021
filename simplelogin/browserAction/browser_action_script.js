
//connect to BAS for this popup session

let pokemon = [];

let uuid = null;


let BASPort = browser.runtime.connect({
  name: "BAS"
});

BASPort.onMessage.addListener(handleBSMessage);
//console.log(BASPort);

//when the page gets loaded attempt an autologin
document.addEventListener('DOMContentLoaded', function(event) {
  console.log("dom");
  var postReq = BASPort.postMessage({
    event: "autologin",
    data: {
    }
  });




  /*loginFrame.onload = () => {
    loginFrame.contentWindow.document.querySelector('#logininpbtn').addEventListener(function () {

    });

  };

  console.log(loginFrame.contentWindow.document.querySelector('#logininpbtn'));*/
});

let frames = {
  loginFrame:  document.querySelector('#loginFrame'),
  signupFrame: document.querySelector('#signupFrame'),
  homeFrame: document.querySelector('#homeFrame'),
  boxFrame: document.querySelector('#boxFrame')
}
let loginFrameDocument = loginFrame.contentWindow.document;
loginFrame.onload = () => {

  //not sure if this is necessary. in fact i believe it isnt but im not sure
  //so i dont want to remove it but i believe that all the frames might load in simultaneously
  //so checking one is like checking all of them
  retbool = true;
  for (var frame in frames) {
    retbool = retbool && frame;
  }

if (retbool) {
  loginFrameDocument = loginFrame.contentWindow.document;
  signupFrameDocument = signupFrame.contentWindow.document;
  homeFrameDocument = homeFrame.contentWindow.document;
  boxFrameDocument = boxFrame.contentWindow.document;


  //////////////////////////////////////////////////////////////////////////////
  //LOGINFRAME

  //console.log(loginFrameDocument.querySelector('#logininpbtn'));
  loginFrameDocument.querySelector('.underlined').addEventListener('click', function (event) {
    swapFrames(signupFrame, loginFrame);

  });

  loginFrameDocument.querySelector("#logininpbtn").addEventListener('click', (e)=> {

    var postReq = BASPort.postMessage({
      "event": "login",
      "data": {
        username: loginFrameDocument.querySelector("#loginusername").value,
        password: loginFrameDocument.querySelector("#loginpassword").value
      }
    });



  });

  //////////////////////////////////////////////////////////////////////////////
  //SIGNUPFRAME
  signupFrameDocument.querySelector(".underlined").addEventListener('click', function (event) {
    swapFrames(loginFrame, signupFrame);
  });
  signupFrameDocument.querySelector("#signupbtn").addEventListener('click', function (event) {

    let signupUsername = signupFrameDocument.querySelector("#signupusername").value;
    let signupPassword = signupFrameDocument.querySelector("#signuppassword").value;
    let signupEmail    = signupFrameDocument.querySelector("#signupemail")   .value;

    if (signupUsername.length >= 3) {

      BASPort.postMessage({
        "event": "signup",
        "data": {
          username: signupUsername,
          password: signupPassword,
          email:    signupEmail
        }
      });

    }

  });




  //////////////////////////////////////////////////////////////////////////////
  //HOMEFRAME

  homeFrameDocument.querySelector("#boxbutton").addEventListener('click', function (event) {
    swapFrames(boxFrame, homeFrame);

  });

  homeFrameDocument.querySelector("#catchbutton").addEventListener('click', function (event) {
    BASPort.postMessage({
      "event": "PKMNEncounter",
      "data": {

      }
    });



  });

  //////////////////////////////////////////////////////////////////////////////
  //BOXFRAME
  boxFrameDocument.querySelector("#homebutton").addEventListener('click', function (event) {
    swapFrames(homeFrame, boxFrame);

  });


}};
//end off onload function event listeners



function swapFrames(frame1, frame2) {
  frame1.hidden = false;
  frame2.hidden = true;
}

function handleBSMessage(message, sender) {

  let ev = message.event;

  if (ev === "loginsuccess") {

    username = message.data.username;
    homeFrameDocument.querySelector("#homeusername").textContent = username;

    BASPort.postMessage({
      event: "PKMNAccess",
      data: {
      }
    });

    swapFrames(homeFrame, loginFrame);
  }

  else if (ev === "loginfailure") {

  }

  else if (ev === "signupsuccess") {
    console.log(message);
    username = message.data.username;
    homeFrameDocument.querySelector("#homeusername").textContent = username;

    swapFrames(homeFrame, signupFrame);

  }

  else if (ev === "signupfailure") {
    let er = message.data.error;
    signupFrameDocument.querySelector("#signuperror").textcontent = er;
  }

  else if (ev === "PKMNAccessSuccess") {
    pokemon = message.data.pokemon;

    for (let i = 0; i < Math.min(pokemon.length, 12); i++) {
      let srcstring = "./images/" + filterPokemonName(pokemon[i].name) + "-icon.png";
      boxFrameDocument.querySelector(`#box${i}`).src = srcstring;
    }

    let homepokemonsrc = "./images/" + filterPokemonName(pokemon[0].name) + ".png";
    homeFrameDocument.querySelector("#homepokemon").src = homepokemonsrc;
  }

  else if (ev === "PKMNPostSuccess") {
    pokemon = message.data.pokemon;

    for (let i = 0; i < Math.min(pokemon.length, 12); i++) {
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
