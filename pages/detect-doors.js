let origImage, doorImage

window.onload = function() {
    window.api.send("getImageWalls");

    window.api.receive("returnImageWalls", (message) => {
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

document.getElementById('detect-doors').onclick = function detectDoors() {
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    window.api.send("detectDoors");
    window.api.receive("detectedDoors", (message) => {
        console.log(message);
        doorImage = message;
        updateImage(message, 'building-plan');
        //window.location.href = "perspective.html";
        createButtons();
        return;
    });
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}

function createButtons()
{
    var btn_div = document.getElementById('btn-container');
    document.getElementById('text-container').textContent = "Have the doors and windows been correctly highlighted? Click on 'toggle' to switch between the detected walls and the original image.";
    var aTagY = document.createElement('a');
    aTagY.setAttribute('href',"generate-model.html");
    var aTagN = document.createElement('a');
    aTagN.setAttribute('href',"fix-doors.html");
    var yesButton = document.createElement("yes-button");
    var noButton = document.createElement("no-button");
    var toggleButton = document.createElement("toggle");
    yesButton.type = "button";
    yesButton.className = "btn btn-success";
    yesButton.value = "Yes";
    yesButton.innerHTML = "Yes";
    noButton.type = "button";
    noButton.className = "btn btn-danger";
    noButton.value = "No";
    noButton.innerHTML = "No";
    toggleButton.type = "button";
    toggleButton.className = "btn btn-info";
    toggleButton.value = "Toggle";
    toggleButton.innerHTML = "Toggle";
    aTagY.appendChild(yesButton);
    aTagN.appendChild(noButton);
    btn_div.appendChild(aTagY);
    btn_div.appendChild(aTagN);
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