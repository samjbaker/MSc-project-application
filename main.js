// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
//require('electron-reload')(__dirname);
let {PythonShell} = require('python-shell');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const sizeOf = require('image-size');

let mainWindow, w, h, dest_image

function createWindow () {
  // getting system width and height and making the display window full screen
  let {width, height} = screen.getPrimaryDisplay().workAreaSize;

  if(width < 100){
    width = 800
  }
  if(height < 100){
    height = 600
  }
  w = width
  h = height
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./pages/index.html')

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
    temp_dir = path.join(app.getPath('temp'))

    let pypath = path.join(__dirname,'venv','bin','python3.7')

    let options = {
      mode: 'text',
      pythonOptions: ['-u'],
      pythonPath: pypath,
      args: [x, y, temp_dir]
    };
    let ret_val;
    let pyshell = new PythonShell(path.join(__dirname,'image_processing','flood-fill.py'), options)
    
    pyshell.on('message', function(message) {
      ret_val = message
    })
    
    pyshell.end(function (err) {
      if (err){
        throw err;
      };
      console.log("The message: "+ ret_val);
      console.log('finished');
      // Send result back to renderer process
      mainWindow.webContents.send("fromMain", ret_val);
    });
});

ipcMain.on("chooseFile", (event, arg) => {
  //dest_image = path.join(__dirname, 'image_processing', 'temp_images', 'temp.jpg')
  dest_image = path.join(app.getPath('temp'),'temp.jpg')
  deleteFile(dest_image);
  const result = dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png","jpg","jpeg","gif","png"] }]
  });
  result.then(({canceled, filePaths, bookmarks}) => {
    //Test cancelling
    if(!canceled){
      src_image = filePaths[0]
      //copyFile(src_image, dest_image)
      if(!checkImageSize(src_image)){
        mainWindow.webContents.send("invalidFile", "Image is too small, please select a better quality image")
        return;
      }
      sharp(src_image)
        .resize(800, 600, {
        kernel: sharp.kernel.nearest,
        fit: 'contain'
      })
      //.toFile(path.join('image_processing', 'temp_images', 'temp.jpg'))
      .toFile(dest_image)
      .then(() => {
        mainWindow.webContents.send("chosenFile", dest_image)
      });
      }
  }).catch(err => {
    console.log(err)
  });
});

//sending image url to renderer
ipcMain.on("getImage", (event, args) => {
  mainWindow.webContents.send("returnImage", dest_image);
});


function deleteFile(path_to_file){
  try {
    if(fs.existsSync(path_to_file)){
      fs.unlinkSync(path_to_file)
      //file removed
    }
  } catch(err) {
    console.error(err)
  }
}

function copyFile(src, dest){
  try {
    if(fs.existsSync(src)){
      fs.copyFileSync(src, dest)
      console.log(src+' was copied to '+dest);
    }
  } catch(err) {
    console.error(err)
  }
}

function checkImageSize(src) { 
  var dimensions = sizeOf(src);
  if(dimensions.width < 100 || dimensions.height < 100){
    return false;
  }
  return true;
}

