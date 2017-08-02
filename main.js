// --- This file creates the main processes used by our application!

// Constants which we'll need which require electron
const {app, Tray, Menu, shell, BrowserWindow} = require('electron');

// Defining a path and a URL
const path = require('path')
const url = require('url')

// Sets up the icons for the taskbar and main app
const trayIconPath = path.join(__dirname, 'icon-default-16.png');
const appIconPath = path.join(__dirname, 'icon-default-256.png');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// This function creates the browser window which we'll use for main setup on starting
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400, 
    height: 600,
    icon: appIconPath
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// ------ This stuff is ALL for the tray icon!!!
app.on('ready', function(){
  // Create new BrowserWindow object for the tray icon, so it runs in the background.
  // As such "show" is set to false.
  win = new BrowserWindow({show: false});
  
  // Defining the app icon
  appIcon = new Tray(trayIconPath);
  
  // This sets up the contextMenu which will be used to feed the menu to the user
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'View your subscribed changes'
    },
    {
      label: 'View PRISM scripts on GitHub',
      click () { require('electron').shell.openExternal('https://github.com/MN-Script-Team/DHS-PRISM-Scripts/') }
    },
    { type: 'separator' },
    { 
      label: 'Exit',
      selector: 'terminate:',
    }
  ]);
  appIcon.setToolTip('BlueZone Scripts Notifications');
  appIcon.setContextMenu(contextMenu);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
