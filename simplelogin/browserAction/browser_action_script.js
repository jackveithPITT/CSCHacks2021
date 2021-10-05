
function reqListener () {
  console.log(this.responseText);
}



form = document.querySelector("#login-form");

form.addEventListener('submit', (e)=> {


  var xhr = new XMLHttpRequest();
  xhr.timeout = 2000;
  let data = new FormData(form);

  xhr.open("POST", "http://localhost:3000/");

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  xhr.send(data);

  xhr.onload = () => {
        console.log(xhr.responseText);
    }

  xhr.ontimeout = () => {
    console.log("asdasdasdasddddsaadds");
  }
});
