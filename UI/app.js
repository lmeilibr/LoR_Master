
const electron = require('electron')
const { Menu, MenuItem, protocol, globalShortcut } = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')

// --- Menu and short cuts ---

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Electron',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
    click: () => { 
      console.log('New Info Window') 
      newInfoWindow()
  }
  }]
}))

Menu.setApplicationMenu(menu)

// const server = require('./appsrc/server.js')
// server.run

const developmentMode = false
// const snapAssist = true
const closeWithoutTracker = true
const headerHeight = 45 // Repeated in preload.js
const defaultRatio = 2.3 // Repeated in preload.js

// const client = require('./appsrc/client.js')

// async function runClient() {
//     const sock = new zmq.Subscriber
  
//     sock.connect("tcp://127.0.0.1:3000")
//     sock.subscribe("kitty cats")
//     console.log("Subscriber connected to port 3000")
  
//     for await (const [topic, msg] of sock) {
//       console.log("received a message related to:", topic.toString(), "containing message:", msg.toString())
//       deckWindow.clientData = "CATAT"
//       // console.log(deckWindow)
//     }
// }

let deckWindow = null
let infoWindow = null


function newDeckWindow() {

  if (deckWindow) return

  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  // let factor = electron.screen.getPrimaryDisplay().scaleFactor
  // console.log("Scale Factor:", factor)

  // --- deckWindow ---
  let windowWidth = 270 // (335)
  let windowMaxWidth = 290
  let windowMinWidth = 240
  // let window.windowWidth = windowWidth
  let windowHeight = Math.floor(windowWidth*defaultRatio)
  let windowPadding = 20

  if (developmentMode) {
    windowWidth = windowWidth + 400
    windowMaxWidth = windowWidth + 400
  }

  deckWindow = new BrowserWindow({
    maxWidth: windowMaxWidth,
    minWidth: windowMinWidth,
    minHeight: headerHeight,
    width: windowWidth, 
    height: windowHeight, 
    x: width - windowWidth - windowPadding,
    y: height - windowHeight - windowPadding,
    frame: false,
    resizable: true,
    webPreferences: {
      preload: __dirname + '/appsrc/preload.js',
      enableRemoteModule: true,
      //nodeIntegration: true,
      nodeIntegrationInWorker: true,
    }
    // titleBarStyle: 'hiddenInset'
  })
  // deckWindow.loadURL(require('url').format({
  //   pathname: path.join(__dirname, 'dist/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))
  deckWindow.loadURL(`file://${__dirname}/dist/index.html`)
  // console.log("Is development?", process.env.NODE_ENV === 'development')

  // Attempted to use a bug? to turn off snapAssist on Windows
  // if (!snapAssist) { 
  //   var minSize = deckWindow.getMinimumSize()
  //   var maxSize = deckWindow.getMaximumSize()
    
  //   deckWindow.setResizable(true)
  //   deckWindow.setMinimumSize(minSize[0], minSize[1])
  //   deckWindow.setMaximumSize(maxSize[0], maxSize[1])
  //   // deckWindow.setMinimumSize
  // }

  // deckWindow.removeMenu()
  deckWindow.setAlwaysOnTop(true, level = "pop-up-menu")
  deckWindow.on('closed', () => {
    deckWindow = null
  })

  if (developmentMode) deckWindow.webContents.openDevTools()
}

function newInfoWindow() {

  if (infoWindow) return

  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  // let factor = electron.screen.getPrimaryDisplay().scaleFactor

  // --- infoWindow ---
  let windowWidth = 270 
  let windowHeight = 270

  if (developmentMode) {
    windowWidth = windowWidth + 400
  }

  infoWindow = new BrowserWindow({
    width: windowWidth, 
    height: windowHeight, 
    x: width / 2 - windowWidth / 2,
    y: height / 2 - windowHeight / 2,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: __dirname + '/appsrc/preload.js',
      enableRemoteModule: true,
      //nodeIntegration: true,
      nodeIntegrationInWorker: true,
    }
    // titleBarStyle: 'hiddenInset'
  })
  infoWindow.loadURL(`file://${__dirname}/dist/info.html`)
  // console.log("Is development?", process.env.NODE_ENV === 'development')

  infoWindow.setAlwaysOnTop(true, level = "pop-up-menu")
  infoWindow.on('closed', () => {
    infoWindow = null
  })

  if (developmentMode) infoWindow.webContents.openDevTools()
}

const appReady = () => {

  if (closeWithoutTracker && !isCheckingTracker) checkTracker()

  // --- deckWindow ---
  newDeckWindow()
  
  // deckWindow.webContents.on('new-window', function (evt, url, frameName, disposition, options, additionalFeatures) {
  //   if(options.width == 800 && options.height == 600){ //default size is 800x600
        
  //       options.width = windowWidth | 0
  //       options.height = windowHeight | 0
        
  //       options.x = 1440 - windowWidth * 2
  //       // console.log(width)
  //       options.y = height - windowHeight
  //       // options.titleBarStyle = 'hidden'
  //       options.frame = true
  //   }
  // })

  // const worker = new Worker(__dirname + '/electron/server.js')
  // server.run
  // runClient()
}

function showDeckWindow() {
  try {
    deckWindow.webContents.executeJavaScript('window.showWindow()');  
  } catch (e) {
    console.log(e)
  }
}

function toggleMinDeckWindow() {
  if (deckWindow.isMinimized()) {
    deckWindow.restore()
  } else {
    deckWindow.minimize()
  }
}

function toggleDeckWindow() {
  try {
    deckWindow.webContents.executeJavaScript('window.toggleWindow()');  
  } catch (e) {
    console.log(e)
  }
}

app.on('ready', () => {
  // --- registers global shortcuts ---
  globalShortcut.register('Alt+CommandOrControl+E', () => {
    // console.log('Electron loves global shortcuts!')
    toggleDeckWindow()
  })

  globalShortcut.register('Alt+CommandOrControl+W', () => {
    toggleMinDeckWindow()
  })

  appReady()
})
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})
app.on('activate', () => {
  newDeckWindow()
})

const tasklist = require('tasklist')
/*
	[
		{
			imageName: 'taskhostex.exe',
			pid: 1820,
			sessionName: 'Console',
			sessionNumber: 1,
			memUsage: 4415488
		},
		…
	]
	*/

var isCheckingTracker = false;
async function checkTracker() {

  isCheckingTracker = true
  
  // Check Python Process with window name containing LoR Master Tracker
  var pythonList = await tasklist({filter: ["IMAGENAME eq python.exe"], verbose: true})
  pythonList = pythonList.filter(ps => ps.windowTitle.indexOf("LoR Master Tracker") != -1)

  // Check LoRMasterTracker.exe process
  var trackerList = await tasklist({filter: ["IMAGENAME eq LoRMasterTracker.exe"], verbose: false})
  
  // console.log(list.filter(ps => ps.imageName.indexOf('python') != -1))
  // console.log("\n pythonList", pythonList.length)
  // console.log("trackerList", trackerList.length)

  if (pythonList.length + trackerList.length <= 0) {
    // There is no tracker running
    console.log("No tracker running")
    // app.quit()
    if (deckWindow) deckWindow.close()
    // app.exit()
  } else {
    // if (!deckWindow) appReady()
  }

  setTimeout(checkTracker, 1000)
}

// checkTracker()