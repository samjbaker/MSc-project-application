window.onload = function() {
    window.api.send("getImage");

    window.api.receive("returnImage", (message) => {
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message+"?"+new Date().valueOf();;
        img_div.appendChild(img);
        return;
    });
}


document.getElementById('yes-corr').onclick = function correctPersp() {
    document.getElementById('text-container').textContent = "Click on the four corners of the image to correct the perspective.";
    //dealing with sending and receiving co-ordinates of picture on click
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    document.getElementById('image-container').onclick = function clickEvent(e) {
    // e = Mouse click event.
    e.preventDefault()
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.
    //Sending co-ords to main.js
    window.api.send("drawCorner", [x.toString(), y.toString()])
    window.api.receive("drawnCorner", (data) => {
        let im_path = data[0]
        updateImage(im_path, 'building-plan')
        if (data[1] == true){
            createButtons();
        }
    });
    }
}

function createButtons() {
    var btn_div = document.getElementById('btn-container');
    btn_div.innerHTML = '';
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"detect-walls.html");
    var button = document.createElement("continue-button");
    button.type = "button";
    button.className = "btn btn-info";
    button.value = "Continue";
    button.innerHTML = "Continue";
    aTag.appendChild(button);
    btn_div.appendChild(aTag);
}

//Updates an image with the specified image
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}