let origImage, doorImage

window.onload = function() {
    window.api.send("getImageDoors");

    window.api.receive("returnImageDoors", (message) => {
        doorImage = message;
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message;
        img_div.appendChild(img);
        return;
    });

    window.api.send("getImage");

    window.api.receive("returnImage", (message) => {
        origImage = message;
        return;
    });
}

document.getElementById('yes-add').onclick = function triggerCrop() {
    var btn_div = document.getElementById('btn-container');
    var yesVar = document.getElementById('yes-add');
    var noVar = document.getElementById('no-add');
    if (yesVar.parentNode) {
        yesVar.parentNode.removeChild(yesVar);
    }
    if (noVar.parentNode) {
        noVar.parentNode.removeChild(noVar);
    }
    document.getElementById('text-container').textContent = 'Adjust the selection until it covers where a door or window should be, then click add. Click toggle to view original image. Click done once complete.'
    var img_div = document.getElementById('image-container');
    img = img_div.children[0]
    const stage = Jcrop.attach(img);
    const rect = Jcrop.Rect.sizeOf(stage.el);
    stage.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
    var addButton = document.createElement("adder");
    addButton.type = "button";
    addButton.className = "btn btn-primary";
    addButton.value = "Add";
    addButton.innerHTML = "Add";
    //Sends points to crop the image on the backend
    addButton.onclick = function doCrop() {
        points = stage.active.pos;
        window.api.send("addDoor", [points.x, points.y, points.w, points.h]);
        window.api.receive("addedDoor", (message) => {
            console.log(message);
            doorImage = message;
            updateImage(message, 'building-plan');
            return;
        });
    }
    var doneButton = document.createElement("done");
    doneButton.type = "button";
    doneButton.className = "btn btn-success";
    doneButton.value = "Done";
    doneButton.innerHTML = "Done";
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"windows.html");
    aTag.appendChild(doneButton);
    btn_div.prepend(aTag);
    btn_div.prepend(addButton);
}

document.getElementById('toggle').onclick = function toggleImage(){
    var pic = document.getElementById('building-plan');
    if (pic.src.includes("s.jpg")){
        updateImage(origImage, 'building-plan');
        //pic.src = origImage;
    }
    else {
        updateImage(doorImage, 'building-plan');
        //pic.src = doorImage;
    }
}

//Adds final option buttons
function finalButtons() {
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}