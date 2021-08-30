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
}

document.getElementById('detect-doors').onclick = function detectDoors() {
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    window.api.send("detectDoors");
    window.api.receive("detectedDoors", (message) => {
        console.log(message);
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
    document.getElementById('text-container').textContent = "Have the doors been correctly detected? Click on the image to switch between the detected walls and the original image.";
    var aTagY = document.createElement('a');
    aTagY.setAttribute('href',"generate-model.html");
    var aTagN = document.createElement('a');
    aTagN.setAttribute('href',"fix-doors.html");
    var yesButton = document.createElement("yes-button");
    var noButton = document.createElement("no-button");
    yesButton.type = "button";
    yesButton.className = "btn btn-success";
    yesButton.value = "Yes";
    yesButton.innerHTML = "Yes";
    noButton.type = "button";
    noButton.className = "btn btn-danger";
    noButton.value = "No";
    noButton.innerHTML = "No";
    aTagY.appendChild(yesButton);
    aTagN.appendChild(noButton);
    btn_div.appendChild(aTagY);
    btn_div.appendChild(aTagN);
    var img_div = document.getElementById('image-container');
    img_div.onclick = function toggleImage()
    {
        var pic = document.getElementById('building-plan');
        if (pic.src.substring(pic.src.length - 5) == "2.jpg"){
            pic.src = origImage;
        }
        else {
            pic.src = wallImage2;
        }
    }
}