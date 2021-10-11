fetch('http://example.com/movies.json')
  .then(response => response.json())
  .then(data => console.log(data));
