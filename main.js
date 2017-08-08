// --- This file creates the main processes used by our application!

// Constants which we'll need which require electron
const {app, Tray, Menu, BrowserWindow} = require("electron")

// Defining a path and a URL
const path = require("path")
const url = require("url")
const Store = require("./js/store.js")

// Sets up the icons for the taskbar and main app
const trayIconPath = path.join(__dirname, "icon-default-16.png")
const appIconPath = path.join(__dirname, "icon-default-256.png")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Instantiate the class for setting window defaults
const store = new Store({
	// We'll call our data file 'user-preferences'
	configName: "user-preferences"
	, defaults: {
		// 400x600 is the default size of our window
		windowBounds: { width: 400, height: 750 }
	}
})

// This function creates the browser window which we'll use for main setup on starting
function createWindow () {
	// Create the browser window.

	// First we'll get our height and width. This will be the defaults if there wasn't anything saved
	let { width, height } = store.get("windowBounds")

	mainWindow = new BrowserWindow({
		width
		, height
		, icon: appIconPath
	})

	// The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
	// to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
	mainWindow.on("resize", () => {
		// The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
		// the height, width, and x and y coordinates.
		let { width, height } = mainWindow.getBounds()
		// Now that we have them, save them using the `set` method.
		store.set("windowBounds", { width, height })
	})

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "index.html")
		, protocol: "file:"
		, slashes: true
	}))

	// Emitted when the window is closed.
	mainWindow.on("closed", function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// ------ This stuff is ALL for the tray icon!!!
app.on("ready", function () {
	// Create new BrowserWindow object for the tray icon, so it runs in the background.
	// As such "show" is set to false.
	var win = new BrowserWindow({show: false})

	// Defining the app icon
	var appIcon = new Tray(trayIconPath)

	// This sets up the contextMenu which will be used to feed the menu to the user
	var contextMenu = Menu.buildFromTemplate([
		{
			label: "View your subscribed changes"
		}
		, {
			label: "View PRISM scripts on GitHub"
			, click () { require("electron").shell.openExternal("https://github.com/MN-Script-Team/DHS-PRISM-Scripts/") }
		}
		, { type: "separator" }
		, {
			label: "Exit"
			, selector: "terminate:"
		}
	])
	appIcon.setToolTip("BlueZone Scripts Notifications")
	appIcon.setContextMenu(contextMenu)
})

// Quit when all windows are closed.
app.on("window-all-closed", function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit()
	}
})

app.on("activate", function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})
