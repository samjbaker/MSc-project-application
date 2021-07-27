// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog } = require('electron');
//require('electron-reload')(__dirname);
let {PythonShell} = require('python-shell');
const path = require('path');
const fs = require('fs');

let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  //if (process.platform !== 'darwin') 
  app.quit()
})

//Handles launching python files for floodfill
ipcMain.on("toMain", (event, args) => {
  //fs.readFile("path/to/file", (error, data) => {
    console.log(`From renderer: `+ args[0] + " " + args[1])
    x = args[0]
    y = args[1]

    let options = {
      mode: 'text',
      pythonOptions: ['-u'],
      args: [x, y]
    };
    let ret_val;
    let pyshell = new PythonShell(path.join(__dirname,'image_processing','flood-fill.py'), options)
    
    pyshell.on('message', function(message) {
      ret_val = message
      //console.log("The message: "+ message);
    })
    
    pyshell.end(function (err) {
      if (err){
        throw err;
      };
      console.log("The message: "+ ret_val);
      console.log('finished');
      /*
      copyFile(ret_val, dest_image);
      deleteFile(ret_val);*/
      mainWindow.webContents.send("fromMain", ret_val);
    });
    

    // Send result back to renderer process
    //mainWindow.webContents.send("fromMain", x);
});

ipcMain.on("chooseFile", (event, arg) => {
  dest_image = path.join(__dirname, 'image_processing', 'temp_images', 'temp.jpg')
  /*try {
    fs.unlinkSync(dest_image)
    //file removed
  } catch(err) {
    console.error(err)
  }*/
  deleteFile(dest_image);
  const result = dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png","jpg","jpeg"] }]
  });
  result.then(({canceled, filePaths, bookmarks}) => {
    //Test cancelling
    if(!canceled){
      //console.log(filePaths[0])
      src_image = filePaths[0]
      copyFile(src_image, dest_image)
      mainWindow.webContents.send("chosenFile", dest_image);
    }
  }).catch(err => {
    console.log(err)
  });
});

function deleteFile(path_to_file){
  try {
    fs.unlinkSync(path_to_file)
    //file removed
  } catch(err) {
    console.error(err)
  }
}

function copyFile(src, dest){
  try {
    fs.copyFileSync(src, dest)
    console.log(src+' was copied to '+dest);
  } catch(err) {
    console.error(err)
  }
}

