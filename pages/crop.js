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
    var cropButton = document.createElement("crop-btn");
    cropButton.type = "button";
    cropButton.value = "Crop";
    cropButton.className = "btn btn-success";
    var img_div = document.getElementById('image-container');
    img = img_div.children[0]
    const stage = Jcrop.attach(img);
    const rect = Jcrop.Rect.sizeOf(stage.el);
    stage.newWidget(rect.scale(.7,.5).center(rect.w,rect.h));
    console.log(stage.active.pos)
}

//Updates an image with the specified
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}