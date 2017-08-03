// This file is required by the index.html file and will be executed in the renderer 
// process for that window. All of the Node.js APIs are available in this process.

function notificationTest() {
    let myNotification = new Notification('Title', {
      body: 'Lorem Ipsum Dolor Sit Amet'
    })

    myNotification.onclick = () => {
      console.log('Notification clicked')
    }
}

function clickTest() {
  var queryColumnNumber = "1326504";
  
  var queryToken = document.getElementById("queryTokenInput").value;


  var GitHubApi = require("github");

  var github = new GitHubApi({
    // optional
    debug: false,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    headers: {
      "Accept": "application/vnd.github.inertia-preview+json"
    },
    //username: queryUser,
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
  });

  // oauth
  github.authenticate({
    type: "oauth",
    token: queryToken
  });

  github.projects.getProjectCards({
  column_id: queryColumnNumber
  }, function(err, res) {
      document.write(JSON.stringify(res));
  });
}

// This bit of jQuery listens for the button click then executes it!
document.querySelector('#testButton').addEventListener('click', clickTest);
