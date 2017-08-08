// This file is required by the index.html file and will be executed in the renderer 
// process for that window. All of the Node.js APIs are available in this process.

// ---------------------------------------------------------------------------- DEFINING CONSTANTS
const SHELL = require("electron").shell											// Required by process to open links in default browser

// ---------------------------------------------------------------------------- DEFINING CLASSES
var FS_storage_connection = require("./js/store.js")							// Filesystem storage/retrieval 
var GitHub_API_connection = require("github")									// Required by all GitHub API calls

// ---------------------------------------------------------------------------- DEFINING GLOBAL VARIABLES/OBJECTS

// This object will be used for all of our GitHub connections throughout the app
var objGitHub = new GitHub_API_connection({
	debug: false
	, protocol: "https"
	, host: "api.github.com"
	, headers: {
		"Accept": "application/vnd.github.inertia-preview+json"					// Required because the projects API is still "experimental"
	}
	, Promise: require("bluebird") 												// Not totally sure why this is used ATM
	, followRedirects: false 													// default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
	, timeout: 5000
})

// Define a new object which stores the info located in the json file, if it
// doesn't exist, load a default blank key
var objKeyFS = new FS_storage_connection({
	configName: "user-login-info"
	, defaults: {
		githubKey: ""
	}
})

// This variable contains the GitHub Key used by multiple functions
var globalGitHubKey = null

// ---------------------------------------------------------------------------- DEFINING FUNCTIONS

// This gets changes from GitHub
function getGitHubChanges () {

	// This function reads all cards in a column and updates the list-item's badge 
	function addColumnTotals (id) {
		objGitHub.projects.getProjectCards({
			column_id: id
		}, function (err, res) {
			$("#badge" + id).text(res.data.length)
		})
	}

	// This function reads all of the columns in a project and adds it to the list
	function addColumnsToList (id, name) {
		$("#changesList").append(
			"<button class='list-group-item' id='col" + id + "'>"
				+ "\n\t<span class='badge' id='badge" + id + "'></span>"
				+ "\n\t" + name
			+ "</button>"
		)
	}

	// Now lets get the data. First we get repo projects, then the specific project 
	// details, then the columns, then the cards. 
	objGitHub.projects.getRepoProjects({
		owner: "MN-Script-Team"
		, repo: "DHS-PRISM-Scripts"
	}, function (err, res) {

		// Log the JSON string for debugging purposes
		console.log("getRepoProjects: " + JSON.stringify(res))

		// Grab the ID from the first project!
		var projectID = res.data[0].id

		// Now we need to go through the project and grab info from each column!
		objGitHub.projects.getProjectColumns({
			project_id: projectID
		}, function (err, res) {

			// Log the JSON string for debugging purposes
			console.log("getProjectColumns: " + JSON.stringify(res))

			// Clear out any existing list items adds a refresh button to the top
			$("#changesList").html(
				"<button class='list-group-item active' id='refreshChanges'>"
					+ "\n\tRefresh this list!"
				+ "\n </button>"
			)

			// Listening for the click to send the API token for authentication
			$("#refreshChanges").on("click", function () {
				validateGitHubKey()
			})

			// Now we go through each column and update the display!
			for (var x in res.data) {
				if (res.data.hasOwnProperty(x)) {
					console.log(JSON.stringify(res.data[x]))					// Log the JSON string for debugging purposes
					addColumnsToList(res.data[x].id, res.data[x].name)			// Add these columns to the list
					addColumnTotals(res.data[x].id)								// Collects/displays the total cards in that column
				}
			}
		})
	})
}

// This checks the GitHub key entered and sees if it's accurate. If it works 
// it'll update the UI and then check for updates
function validateGitHubKey () {

	// OAuth login using user-provided token
	objGitHub.authenticate({
		type: "oauth"
		, token: globalGitHubKey
	})

	// Get and display user details from GitHub
	objGitHub.users.get({}, function (err, res) {

		// Error handling block
		if (err) {

			// If you aren't signed in it'll let you know!
			$("#alertZone").html(
				"<div class='alert alert-danger' role='alert'>"
					+ "\n\t <strong>Oh no!</strong> Invalid token!"
				+ "</div>"
			)

			// Defines the GitHub Key as invalid, then exits the function
			// return validGitHubKey = false
		//	return;
		}

		// Creates a signed-in alert
		$("#alertZone").html(
			"<div class='alert alert-success' role='alert'>"
				+ "\n\t<img id='avatarGitHub' class='img-responsive img-circle'"
				+ " src='" + res.data.avatar_url + "' />"
				+ "\n\t Signed in as <a class='alert-link' href='"
				+ res.data.html_url + "'>" + res.data.login + "</a>!"
			+ "</div>"
		)

		// Get rate limit, may use in the future to warn users who are too close
		objGitHub.misc.getRateLimit({}, function (err, res) {
			console.log(res.data.resources.core.remaining)
		})

		getGitHubChanges()														// Initial check now that we're authenticated
		setInterval(function () { getGitHubChanges() }, 600000)					// Check GitHub for content of project columns every 10 minutes (10 * 60 * 1000)
		// return validGitHubKey = true											// Defines the GitHub Key as valid
	})
}

/*
function notificationTest () {

	let myNotification = new Notification("Title", {
		body: "Lorem Ipsum Dolor Sit Amet"
	})

	myNotification.onclick = () => {
		console.log("Notification clicked")
	}
}
*/

// ---------------------------------------------------------------------------- EVENT LISTENERS

$(document).ready(function () {

	// Grabs the GitHub key from the JSON file on load, and validates it
	$(document).ready(function () {
		globalGitHubKey = objKeyFS.get("githubKey")								// Set the variable from the JSON
		$("#queryTokenInput").val(globalGitHubKey)								// Display the key in the input
		validateGitHubKey()														// Validate via GitHub
	})

	// Listening for the sendToken click to send the API token for authentication
	$("#sendToken").on("click", function () {
		globalGitHubKey = $("#queryTokenInput").val()							// Grab value from input
		objKeyFS.set("githubKey", globalGitHubKey)								// Write the variable to the JSON
		validateGitHubKey()														// Validate via GitHub						
	})

	// Force external links to load in default browser
	$(document).on("click", "a[href^='http']", function (event) {
		event.preventDefault()													// Shut down the default browser
		SHELL.openExternal(this.href)											// SHELL is defined above
	})

})

// ---------------------------------------------------------------------------- LOOPING TO RECHECK API FOR CHANGES
