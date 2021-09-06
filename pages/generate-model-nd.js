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

document.getElementById('model-gen').onclick = function generateModel() {
    //Sending co-ords to main.js
    window.api.send("makeModelND");
    window.api.receive("madeModelND", (data) => {
        console.log("Model generated");
        createButtons();
        //im_path = data
        //updateImage(im_path, 'building-plan')
    });
}

function createButtons()
{
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    document.getElementById('text-container').textContent = "Model generated successfully! Would you like to view or download the model?";
    var aTagV = document.createElement('a');
    aTagV.setAttribute('href',"view-model.html");
    var aTagD = document.createElement('a');
    aTagD.setAttribute('href',"download-model.html");
    var viewButton = document.createElement("view-button");
    var downloadButton = document.createElement("download-button");
    viewButton.type = "button";
    viewButton.className = "btn btn-success";
    viewButton.value = "View";
    viewButton.innerHTML = "View";
    downloadButton.type = "button";
    downloadButton.className = "btn btn-info";
    downloadButton.value = "Download";
    downloadButton.innerHTML = "Download";
    aTagV.appendChild(viewButton);
    aTagD.appendChild(downloadButton);
    btn_div.appendChild(aTagV);
    btn_div.appendChild(aTagD);
    var img_div = document.getElementById('image-container');
    //Change image to success image? Eg tick?
}