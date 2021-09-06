// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
      send: (channel, data) => {
          // whitelist channels
          let validChannels = ["toMain", "chooseFile", "getImage", 
          "cropImage", "detectWalls", "getImageWalls", "getImageWalls2",
          "undoFill", "drawSquare", "detectDoors", "getImageDoors",
          "fillDoors", "undoDoor", "makeModel", "getMesh", "saveFile", "clearImage",
          "drawCorner", "correctPersp", "detectWindows", "getImageCombo", "cleanUp",
          "fillWindows", "undoWindow", "addDoor", "makeModelND"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      receive: (channel, func) => {
          let validChannels = 
          ["fromMain", "chosenFile", "invalidFile", "returnImage", 
          "croppedImage", "detectedWalls", "returnImageWalls", 
          "returnImageWalls2", "undoneFill", "drawnSquare", "detectedDoors", 
          "returnImageDoors", "filledDoors", "undoneDoor", "madeModel", "returnMesh",
          "savedFile", "drawnCorner", "correctedPersp", "detectedWindows",
          "returnImageCombo", "cleanedUp", "filledWindows", "undoneWindow", 
          "addedDoor", "madeModelND"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender` 
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      }
  }
);

