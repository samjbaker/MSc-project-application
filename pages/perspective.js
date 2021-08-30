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
