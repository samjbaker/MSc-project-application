window.onload = function() {
    window.api.send("clearImage");

    window.api.send("getImage");

    window.api.receive("returnImage", (message) => {
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message;
        img_div.appendChild(img);
        return;
    });
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
        updateImage(im_path, 'building-plan')
    });
}

//Implementing undo function
document.getElementById('undo-fill').onclick = function undoFill() {
    window.api.send("undoFill");
    window.api.receive("undoneFill", (message) => {
        im_path = message
        updateImage(im_path, 'building-plan')
        return;
    });
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}