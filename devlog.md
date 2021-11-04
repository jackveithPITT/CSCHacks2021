# CSCHacks 2021 Devlog
I will attempt to detail all of (or at least the most major/headache-inducing/time-consuming) my roadblocks in this document, as well as what I worked on each day so that I can track my progress and hopefully accurately detail the things that got in my way and what I had to learn to solve these issues. I'll also include some neat things I learned or had trouble with that I didn't want to bore the readers with at the bottom of each section.

# Project Creation through Oct 15, 2021

**note - as I am only starting this devlog a few weeks into the creation of the project, this section will be a bit of a dump from the top of my head. Essentially this project consists of two separate applications working together to provide the final service:**
- the Firefox extension itself, which will display the GUI, process input from the User, and send that data to the server
- a node.js server running Express that handles connections from all extension clients, and handles serving web resources to the Users, along with keeping track of their login sessions and the persistent data that accumulates as the extension is used, all being stored in a mySQL database

As I have already made a pretty simple Firefox extension previously (Search 'Youtime' on the extension market) I already knew about the basic construction of an extension, for example the 4 types of scripts for the different ways an extension can interact with the browser, the manifest.json, and so on. I have also made simple node servers and dabbled in Express, but making a full-fledged application is going to be a new experience for me, and presumably a worthy challenge.
### First Things First
the first thing that I wanted to get up and running was the mySQL connection to the Express server. I knew this would be essential so I wanted to get it integrated prior to things getting messy later down the line. I already had mySQL downloaded from previous ventures, and I followed a few guides online that would provide me with a simple template for storing user login data in a database. Data in mySQL is sorted into tables; I keep all login information such as emails, usernames, PIDs, and hashed passwords in a single table. I know that later down the line I will inevitably have to actually create new tables, most likely for each PID/User in order to store the persistent information related to their account.

I then set up some more simple paths in the server, as the connection to the mySQL database is technically a single line of code, two if you count the 'require'. A simple login page, and a POST request that logs a User in if their username and password exist in the database (nothing cryptographically secure yet, that will come later). I also implemented some express middleware, which essentially allow me to perform certain functions on request and response objects in order to process HTTP calls in an efficient manner, and exactly how I would like to. For now I am using the built in static middleware to server static files like CSS documents for HTML pages, a body parser to obtain JSON data from request objects, and express sessions which I will be working with more extensively in the future. As there was not much more I could do with the server at the time, I began work on the Extension.

unmentioned issues/learning:
- learning the mySQL Workbench interface
- mySQL server as a Windows service
- HTTP requests and their differing types/usage
- express routing

### First Connections
I wanted to get a connection started between the Extension in the browser and the Server I was hosting on computer using localhost. This is where a lot of issues begin. First I needed to select a way to send these requests to the server. My initial idea was to use XMLHTTPRequests in order to get resources from the server to update the GUI of the extension. However I found out about websockets shortly after, which offer a way to create a persistent connection between a client and server, allowing a request or data transfer to be initiated by either the client or the server. Websockets are natively supported by nearly all modern browsers, so it seemed like a great choice. I worked on implementing these in my extension, but I found that no matter what I did I was unable to get them to work! I set the idea aside for a bit and tried to implement the fetch command, which is much simpler than establishing a websocket connection and is essentially a more supported and flexible XHR request. But I was unable to get this to work either!
<hr>

 This so far has by far been my largest roadblock. I learned many things trying to fix this issue, such as HTTP headers, Content Security Policy permissions, Cross Origin Resource Sharing, etc. However I was unable to find anything about this issue online, so I had to figure it out myself. The entire time I had all of my server requesting code in my **Browser Action Script**, a script that runs when the little extension icon in the upper right corner of the browser chrome is clicked. I had it this way as I thought it would be best to establish a connection when the User wanted to use the extension, and not have a connection persistently online. HOWEVER, on a whim I decided to try moving this code into the **Background Script**, which is run once when the extension is loaded. And the fetch request went through! my `console.log()` calls on both ends (client and server) both displayed their respective payloads, and all of the meaningful routines of the Extension completed with only a few (unrelated) errors. As far as I can tell, the Browser Action does not have the permissions to actually make requests to a server on its own, and thus must delineate such actions to the more privileged Background Script. Phew! Next time I will be implementing exactly what I just mentioned, because Extensions have a built in way to allow the different scripts to communicate with each other using `browser.runtime.connect()`.

 # Oct 16, 2021
 ### SSL Signing
 today began with me attempting to figure out why I was getting errors when trying to push my project to the main branch of my github repo. Learned a few things about fetching, pulling etc. and was able to fix my non-fast-forward issue. This is the first project where I am extensively using git from the command line (or at all for that matter) so its nice to be able to understand more about this useful version control system. Now that I'm able to establish a websocket connection in the first place, I'm going to make sure that its secure using Secure Sockets Layer (SSL) by generating a self-signed certificate using openSSL's tools. This lets me run my entire server over HTTPS, which is more secure than HTTP. I ran into some issues getting this to work, but it turned out to be a silly mistake where I didn't actually tell the server what the certificate passphrase was. Now I can securely transfer data with my fetch requests and websockets.

 cool stuff:
 - certificate authorities and self signing
 - multiple connections sharing a ports
 - pass express app to HTTPS server

 ### Script Communication
 I was also able to use the messaging API provided by Firefox extensions in order to establish a connection between my BAS (Browser Action Script) and BS (Background Script). I might inevitably need to do this again in the future between the CS (Content Script), the script which is run on the individual tabs and pages loaded in the browser, and the BS. I might need it to be able to process information about the tabs ( specifically the URL) in order to determine URL uniqueness. However the BS might be able to do this on its own; this is a problem for a later date. Now that the BAS and the BS are hooked up, I will be able to use events from the Browser Action's HTML page to query resources from the server. For now I was only able to do some dummy `fetch()` calls to make sure that the client and server responded correctly; my plan for the future is to use a fetch request to log in the User, then establish a secure websocket connection to the server for a more privileged User.

 cool stuff:
 - `TypeError: Network Error` (fun and enjoyable and useful error message :D)
 - HTTPS headers and HTTP request payloads

 #Oct 21-22, 2021
 ### sessions and databases
 ugh, big midterm week so not much time to work on this. Anyways, These few days were about switching databases and logging in. I decided to switch to MongoDB from mySQL because of a few reasons, most notably that I wanted have the data in the cloud so that I can work from various machines using the same dataset. I was also reminded of how convenient it is work with simple JSON objects (shoutout to Mike). I took a bit more of a thorough glance at the `express-session` documentation because I wanted to be able to have a persistent user session so a User wouldn't have to login every time they close and reopen the extension popup. Turns out the implementation was simpler than I thought it would be, simply a case of whether a variable I define in the session is true, by attaching the `loggedin` attribute to the session object. The `loggedin` attribute will only exist if the session (whose lifespan is the same as the browser session) has authenticated with username and password. I have a table in my MongoDB database that holds username and hashed passwords combinations, along with some other info.

### Hashing and async
In order to hash the passwords to a sufficient degree, I used the npm package `bcrypt`, which makes hashing and comparing passwords quite simple. So now, if the user already has a loggedin session, great, they can proceed. If they don't, they are asked to provide legitimate credentials, which are compared against data pulled from the cloud, authenticating the user if the username and password match. Ran into some issues with asynchronous function calls, but luckily the bcrypt functionality is able to be called asynchronously; the method of returning a Promise wasn't functioning properly when combined with opening a connection to the MongoDB cluster. I took a bit of time to educate myself on asynchronous function calls, as they are relevant in many niches of computer science, and Promises, which are integral to using web based javascript.

 - express sessions
 - TLS and password security
 - databases and hashing
 - Promises and asynchronous functions in JS

 # Oct 23, 2021
 ### getting files from the server
 right now I'm putting off getting the dynamic HTML of the popup working because I know its going to be a challenge and I might as well get other functions working beforehand anyways. The most important is probably the querying of server resources like images that I will potentially save locally depending on whether the User needs them or not; if a file is most likely going to be used more than a few times then I would rather it be stored Client side as opposed to having to send a request each time. This might actually be overkill for the time being - I wrote a quick python script (and looked up every function because I never use python) to download the HG/SS sprites as well as their current generation icons of the original 151 pokemon  from pokemondb. these 252 files take up only 193 KB in total, which is a really negligible amount of space overhead. I plan on doing it as a proof of concept however, as the functionality might be necessary in the future and I might as well do it now for reference. I worked on cleaning up the connection between the Browser Action Script and the Background Script as well. The BAS connects only once to BS in order to convey its desire for authentication, but in the future it will also query for resources stored in the BS.

 - python image scraping
 - how many ways I can't implement dynamic html how I want
 - querying and posting data to mongodb

 # Oct 24, 2021
 ### dynamic HTML
 although I said I'd put off working on the dynamic HTML, an idea came to me and after a bit of investigating a solution had been found. So this is the HTML episode now. As far as my research could tell, there is no way to directly change the entire HTML document being displayed by an application; this feature would make my life very easy per the fact that I have a few HTML pages I would like to manipulate to display varying kinds of information to the User. The workaround that I found makes use of iframes: an HTML element that allows one to display a full HTML page inside of another document, and the hidden keyword in HTML tags. the hidden keyword can be toggled on and off using the BAS and makes it seem as if the HTML element that's hidden doesn't even exist. I can put each of the (currently 4) separate HTML documents into their own iframes, and show/hide them as needed in order to display different screens such as the login and signup screens, and the 2 game screens. In all honesty, I have absolutely no clue how jank this approach is, but I'm sure it can't be that bad. :). At this point I am running low on time and cant afford to spend too long on issues like this. Along with figuring out the specifics of implementing this design, I was able to add a few more event listeners to the elements of the pages so that the autologin feature works correctly and one can flick between the sign up and login screens at will. The only large issue presenting itself right now is that sometimes the Frames aren't defined when I need them to be, such as when I'm receiving the username and uuid of a User from the database. I will work on fixing these this week, as well as finally programming the game logic. Oh, and the extension has a neat little icon now.

  - iframes, hidden, listeners, much more HTML
  - HTML events and their different use cases
  - CSS properties

# Oct 30, 2021
### Routing
the majority of my time on this project has simply been going to routing. I have most things figured out for what I need, so for today I focused mostly on getting wires running to and from all the places that need to be connected. For events such as an attempted login or signup, I need to send a message between extension scripts, across the internet to the server, and back again. The program right now is simple however, and allows me to use some less scalable techniques in order to streamline development and cut costs, both in terms of space, computer time, and the 24 hours I get in a day. For example, the way that I am currently using iframes to manage and separate routines and UIs is probably not industry standard past the few frames that I am using in my case. After some time spent routing, login, autologin, signup, and retrieving pokemon data from the database are now fully supported. What should be left is simply updating the database with new user data as Users catch pokemon, as well as logic to track website uniqueness and game currency.

 - didnt learn much this time, but something interesting i did find is that data can be sent over websockets in a few different forms, but what is primarily used is a string. we can use the fact that JSON objects can be stringified and decoded on the other side in order to send event objects as one long string to inform the server about what we want.


Oct 2
fixed up the image files and stuff
modified css for pages, mostly learned about flex box, making decisions about game logic and states

Oct 3
loading polish, making sessions and login more consistent, standardizing how i send messages from client to server

 - firefox extenson structure
 - expressjs web application structure
 - HTTPS/TLS
 - HTTPS Headers
 - internet communication standards (CORS, etc.)
 - server routing
 - websockets
 - Secure Sockets Layer
 - sessions/cookies
 - mySQL (ended up scrapping)
 - mongoDB
 - how to actually use git like a real human
 - credential transfer and storage
 - encryption and Hashing
 - session stores
 - python web scraping
 - firefox extension messaging API
 - client-server model
 - HTML/CSS and their quirks
 - javascript asynchronous functions and Promises
 - MVC model
