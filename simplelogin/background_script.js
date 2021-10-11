// Put all the javascript code here, that you want to execute in background.


  const myRequest = new Request('http://localhost:3000/test');




  fetch(myRequest)
  .then(response => {
    console.log("achieved not Network Error!");
  })
  .then(data => console.log(data));
