//dealing with sending and receiving co-ordinates of picture on click
document.getElementById('model-dl').onclick = function saveFile() {
    window.api.send("saveFile");
    window.api.receive("savedFile", (data) => {
        im_path = data
        console.log("File saved");
    });
}