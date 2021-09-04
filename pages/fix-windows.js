let origImage, comboImage

window.onload = function() {
    window.api.send("getImageCombo");

    window.api.receive("returnImageCombo", (message) => {
        comboImage = message
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message;
        console.log(message);
        img_div.appendChild(img);
        return;
    });

    window.api.send("getImage");

    window.api.receive("returnImage", (message) => {
        origImage = message;
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
    //Sending co-ords to main.js
    window.api.send("fillWindows", [x.toString(), y.toString()])
    window.api.receive("filledWindows", (data) => {
        im_path = data
        updateImage(im_path, 'building-plan')
    });
}

//Updates an image with the specified one
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}

//Implementing undo function
document.getElementById('undo-fix').onclick = function undoFill() {
    window.api.send("undoWindow");
    window.api.receive("undoneWindow", (message) => {
        im_path = message
        updateImage(im_path, 'building-plan')
        return;
    });
}

document.getElementById('toggle').onclick = function toggleImage()
    {
        var pic = document.getElementById('building-plan');
        if (pic.src.substring(pic.src.length - 5) == "s.jpg"){
            pic.src = origImage;
        }
        else {
            pic.src = comboImage;
        }
    }