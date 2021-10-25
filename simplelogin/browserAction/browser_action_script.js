
//connect to BAS for this popup session

let username = "prev";
let uuid = null;


let BASPort = browser.runtime.connect({
  name: "BASConnection"
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
  homeFrame: document.querySelector('#homeFrame')
}
let loginFrameDocument = loginFrame.contentWindow.document;
if (loginFrameDocument) {console.log(loginFrameDocument);}
loginFrame.onload = () => {

  retbool = true;
  for (var frame in frames) {
    retbool = retbool && frame;
  }

if (retbool) {
  loginFrameDocument = loginFrame.contentWindow.document;
  signupFrameDocument = signupFrame.contentWindow.document;
  homeFrameDocument = homeFrame.contentWindow.document;


  //console.log(loginFrameDocument.querySelector('#logininpbtn'));
  loginFrameDocument.querySelector('.underlined').addEventListener('click', function (event) {
    swapFrames(signupFrame, loginFrame);

  });

  loginFrameDocument.querySelector("#logininpbtn").addEventListener('click', (e)=> {

    var postReq = BASPort.postMessage({
      event: "login",
      data: {
        username: loginFrameDocument.querySelector("#loginusername").value,
        password: loginFrameDocument.querySelector("#loginpassword").value
      }
    });



  });

  signupFrameDocument.querySelector(".underlined").addEventListener('click', function (event) {
    swapFrames(loginFrame, signupFrame);
  });

  homeFrameDocument.querySelector("#homeusername").textContent = username;


}};
//end off onload function event listeners



function swapFrames(frame1, frame2) {
  frame1.hidden = false;
  frame2.hidden = true;
}

//console.log(loginFrame.contentWindow.document);



//console.log(loginFrame);

//console.log(loginFrame.contentWindow.document.querySelector('form'));

function handleBSMessage(message, sender) {

  let ev = message.event;

  if (message.event === "loginsuccess") {


    retbool = true;
    for (var frame in frames) {
      retbool = retbool && frame;
    }
    console.log(retbool);
    if (true) {
      console.log(message);
      username = message.username;
      homeFrameDocument.querySelector("#homeusername").textContent = username;
      uuid = message.uuid;
      homeFrameDocument.querySelector("#homeuuid").textContent = uuid;
    }



    //loginFrame.querySelector("#time").textContent = "login success";
    swapFrames(homeFrame, loginFrame);
  }

  console.log(message);
}




//save the form as a variable to access user and pass
form = loginFrame.querySelector("#login-form");

function reqListener () {
  console.log(this.responseText);
}
