window.onload = function() {
    window.api.send("getImageDoors");

    window.api.receive("returnImageDoors", (message) => {
        var img_div = document.getElementById('image-container');
        var img = document.createElement("img");
        img.id = 'building-plan'
        img.src = message;
        img_div.appendChild(img);
        return;
    });
}