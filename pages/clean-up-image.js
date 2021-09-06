let origImage, wallImage, wallImage2

window.onload = function() {
    window.api.send("getImageWalls");
    window.api.receive("returnImageWalls", (message) => {
        wallImage = message;
        return;
    });

    window.api.send("getImage");
    window.api.receive("returnImage", (message) => {
        origImage = message;
        return;
    });

    window.api.send("getImageWalls2");
    //getting file location of processed image for future use
    window.api.receive("returnImageWalls2", (message) => {
        wallImage2 = message;
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-walls'
        img.src = message;
        img_div.appendChild(img);
        return;
    });
}

//Toggles image between input and detected walls
document.getElementById('toggle').onclick = function toggleImage()
    {
        var pic = document.getElementById('building-walls');
        if (pic.src.includes("2.jpg")){
            //pic.src = origImage;
            updateImage(origImage, 'building-walls');
        }
        else {
            //pic.src = wallImage2;
            updateImage(wallImage2, 'building-walls')
        }
    }


document.getElementById('clean-yes').onclick = function removeWalls() {
    var btn_div = document.getElementById('btn-container');
    var img_div = document.getElementById('image-container');
    //btn_div.textContent = '';
    var yesVar = document.getElementById('clean-yes');
    var noVar = document.getElementById('clean-no');
    if (yesVar.parentNode) {
        yesVar.parentNode.removeChild(yesVar);
    }
    if (noVar.parentNode) {
        noVar.parentNode.removeChild(noVar);
    }

    document.getElementById('text-container').textContent = "Select any erroneously selected walls with the tool and click 'remove' when ready. When all extra sections are removed click 'done";
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"detect-doors.html");
    var removeButton = document.createElement("remove-button");
    var doneButton = document.createElement("done-button");
    removeButton.type = "button";
    removeButton.className = "btn btn-danger";
    removeButton.value = "Remove";
    removeButton.innerHTML = "Remove";
    img = img_div.children[0]
    const stage = Jcrop.attach(img);
    const rect = Jcrop.Rect.sizeOf(stage.el);
    stage.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
    removeButton.onclick = function doRemove() {
        points = stage.active.pos;
        img_div.onclick = function stopToggle() {
            return;
        }
        window.api.send("drawSquare", [points.x, points.y, points.w, points.h]);
        //stage.destroy();
        window.api.receive("drawnSquare", (message) => {
            console.log("square ",message);
            wallImage2 = message;
            updateImage(message, 'building-walls');
            return;
        });
    }
    doneButton.type = "button";
    doneButton.className = "btn btn-success";
    doneButton.value = "Done";
    doneButton.innerHTML = "Done";
    aTag.appendChild(doneButton);
    btn_div.prepend(removeButton);
    btn_div.prepend(aTag);
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}