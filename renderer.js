// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let im_path, target, temp_img, out
//dealing with selecting file
document.getElementById('choose-file').onclick = function clickEvent(e) {
    e.preventDefault();
    window.api.send("chooseFile");

    window.api.receive("invalidFile", (message) => {
        alert(message);
        return;
    });

    window.api.receive("chosenFile", (temp) => {
        console.log('received file '+temp)
        temp_img = temp
        out = '<img id="input-plan" src="' + temp + '" alt="basic-plan"/>';
        target = document.getElementById('image-container');
        target.innerHTML = out
        txt_target = document.getElementById('text-container').textContent = 'Are you happy with this image?';
        return;
      })
}


//dealing with sending and receiving co-ordinates of picture on click
document.getElementById('image-container').onclick = function clickEvent(e) {
    // e = Mouse click event.
    e.preventDefault()
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.
    console.log("Left? : " + x + " ; Top? : " + y + ".");
    //flood_fill(x, y);
    //Sending co-ords to main.js
    window.api.send("toMain", [x.toString(), y.toString()])
    window.api.receive("fromMain", (data) => {
        console.log(`${data} main process`)
        im_path = data
        updateImage(im_path, 'input-plan')
    });
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}