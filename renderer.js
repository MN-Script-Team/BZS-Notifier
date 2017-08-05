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

function getGitHubChanges() {
  
  var queryColumnNumber = "1326504";
  
  var keyToCheck = document.getElementById("queryTokenInput").value;



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
    token: keyToCheck
  });
  
  github.projects.getProjectCards({
    column_id: queryColumnNumber
  }, function(err, res) {
    console.log(JSON.stringify(res));
    
    // Displays the total changes ---------<<<<<< NEEDS WORK
    document.getElementById("totalTest").innerHTML = "Total found: " + res.data.length;
    
  });
  
  
}

function checkGitHubKey() {
  
  // Gets the key
  var keyToCheck = document.getElementById("queryTokenInput").value;

  // Defines the object class
  var GitHubApi = require("github");

  // Defines the object
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
    token: keyToCheck
  });
  
  // Get user details!!
  github.users.get({}, function(err, res) {
    if(err) {
      
      document.getElementById("alertZone").innerHTML = '<div class="alert alert-danger" role="alert"><strong>Oh no!</strong> Invalid token!</div>';
      
      console.log(err);
      return;
    }
    
    // Creates a signed-in alert
    document.getElementById("alertZone").innerHTML = '<div class="alert alert-success" role="alert"><img id="avatarGitHub" class="img-responsive img-circle" src="' + res.data.avatar_url + '" /> Signed in as <a class="alert-link" href="' + res.data.html_url + '">' + res.data.login + '</a>!</div>';
    
    // Sends to console for debugging
    console.log(JSON.stringify(res));
  });
  
}

// This function retrieves the already existing API key
function getAPIKey() {
  
  // Define the Store class from the store.js file
  const Store = require('./js/store.js');
  
  // Define a new object which stores the info located in the json file, if it doesn't exist, load a default key
  const store = new Store({
    configName: 'user-login-info',
    defaults: {
      githubKey: ""
    },
  });
  
  // Display the key!
  document.getElementById("queryTokenInput").value = store.get('githubKey');
  
  // Let's check the key to see if it's valid
  checkGitHubKey();
  
}

// This function modifies the stored API key
function setAPIKey() {
  
  // Define the Store class from the store.js file
  const Store = require('./js/store.js');
  
  // Define a new object which stores the info located in the json file, if it doesn't exist, load a default key
  const store = new Store({
    configName: 'user-login-info',
    defaults: {
    },
  });
  
  var githubKeyEntered = document.getElementById("queryTokenInput").value;
  
  // Store the key!
  store.set('githubKey', githubKeyEntered);
  
  // Let's check the key to see if it's valid
  checkGitHubKey();
  
}

// This bit of JavaScript listens for the button click then executes it!
document.querySelector('#sendToken').addEventListener('click', setAPIKey);

// Now we'll auto-fill the GitHub API key
document.getElementById("queryTokenInput").onload = getAPIKey() ;

// <<<<<< THIS MAY NEED WORK
document.querySelector('#checkChanges').addEventListener('click', getGitHubChanges);

// Required by following jQuery snippet
const shell = require('electron').shell;

// Using jQuery to prevent external links from firing within the app, as they should load outside
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});
