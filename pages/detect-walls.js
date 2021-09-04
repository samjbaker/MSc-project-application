let origImage, wallImage, wallImage2

//Getting file locations for images
window.onload = function() {
    window.api.send("getImage");
    //Loading the image from disk to be displayed on load
    window.api.receive("returnImage", (message) => {
        origImage = message;
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message;
        img_div.appendChild(img);
        return;
    });

    window.api.send("getImageWalls");
    //getting file location of processed image for future use
    window.api.receive("returnImageWalls", (message) => {
        wallImage = message;
        return;
    });

    window.api.send("getImageWalls2");
    //getting file location of processed image for future use
    window.api.receive("returnImageWalls2", (message) => {
        wallImage2 = message;
        return;
    });
}

document.getElementById('detect-walls').onclick = function detectWalls() {
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    window.api.send("detectWalls");
    window.api.receive("detectedWalls", (message) => {
        //console.log(message);
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
    pic.src = path;
    //pic.src = path+"?"+new Date().valueOf();
}

function createButtons()
{
    var btn_div = document.getElementById('btn-container');
    document.getElementById('text-container').textContent = "Have all the walls been highlighted correctly? Click 'toggle' to switch between the detected walls and the original image.";
    var aTagY = document.createElement('a');
    aTagY.setAttribute('href',"clean-up-image.html");
    var aTagN = document.createElement('a');
    aTagN.setAttribute('href',"flood-fill.html");
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
        if (pic.src.substring(pic.src.length - 5) == "2.jpg"){
            pic.src = origImage;
        }
        else {
            pic.src = wallImage2;
        }
    }
    btn_div.appendChild(toggleButton);
}
