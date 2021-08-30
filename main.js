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
    //console.log(`From renderer: `+ args[0] + " " + args[1])
    x = args[0]
    y = args[1]
    temp_dir = path.join(app.getPath('temp'))
    temp_file = path.join(app.getPath('temp'),'temp.jpg')
    back_up = path.join(app.getPath('temp'),'temp_undo.jpg')
    copyFile(temp_file, back_up)

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
      //console.log("The message: "+ ret_val);
      //console.log('finished');
      // Send result back to renderer process
      mainWindow.webContents.send("fromMain", ret_val);
    });
});

//Handles choosing file from user's filesystem
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
        fit: 'contain',
        background: { r: 255, g: 255, b: 255}
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
    let origImage = path.join(app.getPath('temp'),'temp.jpg')
    mainWindow.webContents.send("returnImage", origImage);
});

//Crops image to specified dimensions
ipcMain.on("cropImage", (event, args) => {
  origImage = path.join(app.getPath('temp'),'temp.jpg')
  croppedImage = path.join(app.getPath('temp'),'temp1.jpg')
  outImage = path.join(app.getPath('temp'),'temp2.jpg')
  x = args[0];
  y = args[1];
  w1 = args[2];
  h1 = args[3];
  console.log(args);
  sharp(origImage).extract({ width: w1, height: h1, left: x, top: y }).toFile(croppedImage)
    .then(function(new_file_info) {
        console.log("Image cropped and saved");
        //mainWindow.webContents.send("croppedImage", croppedImage);
        sharp(croppedImage).resize(800, 600, {
          kernel: sharp.kernel.nearest,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255}
        }).toFile(origImage)
        .then(() => {
          mainWindow.webContents.send("croppedImage", origImage);
        })
        .catch(function(err) {
          console.log("An error occured",err);
        })
    })
    .catch(function(err) {
        console.log("An error occured", err);
    });
});

//Handles launching python script for detecting walls from detect-walls.html
ipcMain.on("detectWalls", (event, args) => {
  //console.log(`From renderer: `+ args[0] + " " + args[1])
  temp_dir = path.join(app.getPath('temp'))
  file_name = "temp"
  extension = ".jpg"

  let pypath = path.join(__dirname,'venv','bin','python3.7')

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    pythonPath: pypath,
    args: [temp_dir, file_name, extension]
  };
  let ret_val;
  let pyshell = new PythonShell(path.join(__dirname,'image_processing','detect_walls.py'), options)
  
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
    mainWindow.webContents.send("detectedWalls", ret_val);
  });
});


//Sending image of processed walls back to renderer
ipcMain.on("getImageWalls", (event, args) => {
  let wallImage = path.join(app.getPath('temp'),'temp_walls.jpg')
  mainWindow.webContents.send("returnImageWalls", wallImage);
});

//Sending image of processed walls in colour back to renderer
ipcMain.on("getImageWalls2", (event, args) => {
  let wallImage2 = path.join(app.getPath('temp'),'temp_walls2.jpg')
  mainWindow.webContents.send("returnImageWalls2", wallImage2);
});

//Implementing undo function for flood-fill
ipcMain.on("undoFill", (event, args) => {
  let temp_file = path.join(app.getPath('temp'),'temp.jpg')
  let back_up = path.join(app.getPath('temp'),'temp_undo.jpg')
  copyFile(back_up, temp_file)
  mainWindow.webContents.send("undoneFill", temp_file);
});

//Handles python script to delete sections of wall from clean-up-image.html
ipcMain.on("drawSquare", (event, args) => {
  x = args[0];
  y = args[1];
  w1 = args[2];
  h1 = args[3];
  temp_dir = path.join(app.getPath('temp'))
  file_name = "temp"
  extension = ".jpg"

  let pypath = path.join(__dirname,'venv','bin','python3.7')

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    pythonPath: pypath,
    args: [temp_dir, x, y, w1, h1]
  };
  let ret_val;
  let pyshell = new PythonShell(path.join(__dirname,'image_processing','draw_square.py'), options)
  
  pyshell.on('message', function(message) {
    ret_val = message
  })
  
  pyshell.end(function (err) {
    if (err){
      throw err;
    };
    console.log("Square draw msg: "+ ret_val);
    // Send result back to renderer process
    mainWindow.webContents.send("drawnSquare", ret_val);
  });
});

//Triggers python script to detect doors from detect-doors.html
ipcMain.on("detectDoors", (event, args) => {
  //console.log(`From renderer: `+ args[0] + " " + args[1])
  temp_dir = path.join(app.getPath('temp'))
  file_name = "temp_walls"
  extension = ".jpg"

  let pypath = path.join(__dirname,'venv','bin','python3.7')

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    pythonPath: pypath,
    args: [temp_dir, file_name, extension]
  };
  let ret_val;
  let pyshell = new PythonShell(path.join(__dirname,'image_processing','detect_doors.py'), options)
  
  pyshell.on('message', function(message) {
    ret_val = message
  })
  
  pyshell.end(function (err) {
    if (err){
      throw err;
    };
    console.log("Door message: "+ ret_val);
    // Send result back to renderer process
    mainWindow.webContents.send("detectedDoors", ret_val);
  });
});


//sending image url to renderer
ipcMain.on("getImageDoors", (event, args) => {
  let doorImage = path.join(app.getPath('temp'),'temp_doors.jpg')
  mainWindow.webContents.send("returnImageDoors", doorImage);
});

//Deletes selected file
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

//Copies file from one place to another
function copyFile(src, dest){
  try {
    if(fs.existsSync(src)){
      fs.copyFileSync(src, dest)
      //console.log(src+' was copied to '+dest);
    }
  } catch(err) {
    console.error(err)
  }
}

//Checks size of selected image
function checkImageSize(src) { 
  var dimensions = sizeOf(src);
  if(dimensions.width < 100 || dimensions.height < 100){
    return false;
  }
  return true;
}

