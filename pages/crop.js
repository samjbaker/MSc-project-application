window.onload = function() {
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

document.getElementById('yes-crop').onclick = function triggerCrop() {
    var btn_div = document.getElementById('btn-container');
    btn_div.textContent = '';
    document.getElementById('text-container').textContent = 'Adjust the selection to your satisfaction, then click crop';
    var img_div = document.getElementById('image-container');
    img = img_div.children[0]
    const stage = Jcrop.attach(img);
    const rect = Jcrop.Rect.sizeOf(stage.el);
    stage.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
    //aTag.setAttribute('href',"");
    var cropButton = document.createElement("cropper");
    cropButton.type = "button";
    cropButton.className = "btn btn-success";
    cropButton.value = "Crop";
    cropButton.innerHTML = "Crop";
    //Sends points to crop the image on the backend
    cropButton.onclick = function doCrop() {
        points = stage.active.pos;
        window.api.send("cropImage", [points.x, points.y, points.w, points.h]);
        stage.destroy();
        window.api.receive("croppedImage", (message) => {
            console.log(message);
            updateImage(message, 'building-plan');
            window.location.href = "perspective.html";
            return;
        });
    }
    btn_div.prepend(cropButton);
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