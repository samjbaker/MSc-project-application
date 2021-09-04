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
    btn_div.textContent = '';
    document.getElementById('text-container').textContent = 'Adjust the selection until it covers where a door or window should be, then click add. Click toggle to view original image. Click done once complete.'
    var img_div = document.getElementById('image-container');
    img = img_div.children[0]
    const stage = Jcrop.attach(img);
    const rect = Jcrop.Rect.sizeOf(stage.el);
    stage.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
    //aTag.setAttribute('href',"");
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
            updateImage(message, 'building-plan');
            return;
        });
    }
    btn_div.prepend(addButton);
    var doneButton = document.createElement("done");
    doneButton.type = "button";
    doneButton.className = "btn btn-success";
    doneButton.value = "Done";
    doneButton.innerHTML = "Done";
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"windows.html");
    aTag.appendChild(doneButton);
    btn_div.appendChild(aTag);
    var toggleButton = document.createElement("toggle");
    toggleButton.type = "button";
    toggleButton.className = "btn btn-info";
    toggleButton.value = "Toggle";
    toggleButton.innerHTML = "Toggle";
    toggleButton.onclick = function toggleImage()
    {
        var pic = document.getElementById('building-plan');
        if (pic.src.substring(pic.src.length - 5) == "s.jpg"){
            pic.src = origImage;
        }
        else {
            pic.src = doorImage;
        }
    }
    btn_div.appendChild(toggleButton);
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