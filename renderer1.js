// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

//let img, out, target, temp_img

//dealing with sending and receiving co-ordinates of picture on click
document.getElementById('image-container').onclick = function clickEvent(e) {
    // e = Mouse click event.
    e.preventDefault()
    /*
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.
    console.log("Left? : " + x + " ; Top? : " + y + ".");
    //flood_fill(x, y);
    //Sending co-ords to main.js
    window.api.send("toMain", [x.toString(), y.toString()])
    window.api.receive("fromMain", (data) => {
        console.log(`${data} main process`)
        console.log(data)
        setTimeout(() => {
            updateImage('image-container') 
        })
    })
    */
   out = '<img id="input-plan" src="./image_processing/temp_images/temp1.jpg" alt="basic_plan">'
   target = document.getElementById('image-container');
   target.innerHTML = out
}


//dealing with selecting file
document.getElementById('choose-file').onclick = function clickEvent(e) {
    e.preventDefault();
    window.api.send("chooseFile");

    window.api.receive("chosenFile", (temp) => {
        temp_img = temp
        /*
        out = '<img id="input-plan" src="' + temp + '" alt="basic-plan onclick="pixelClick()"/>';
        //console.log(out);
        target = document.getElementById('image-container');
        target.innerHTML = out
        */
        out = createImage(temp);
        target = document.getElementById('image-container');
        target.appendChild(out);
      })
    return;
}

function reload(){
    var container = document.getElementById('image-container');
    var content = container.innerHTML;
    container.innerHTML= content; 
    
   //this line is to watch the result in console , you can remove it later	
    console.log("Refreshed"); 
}

function updateImage(id)
{
    target = document.getElementById(id);
    var content = target.innerHTML;
    console.log(content)
    
    target.innerHTML = content;
    //setTimeout(updateImage, 1000);
    console.log("Refreshed");
    
    /*
    if(image.complete) {
        var new_image = new Image(); 
        //set up the new image
        new_image.id = 'input-plan';
        new_image.src = image.src;  
        console.log(new_image.src);         
        // insert new image and remove old
        image.parentNode.insertBefore(new_image,image);
        image.parentNode.removeChild(image);
    }

    setTimeout(updateImage, 1000);
    console.log("Refreshed"); 
    */
}

function createImage(src) {
    var img = new Image();
    img.src = src
    img.onload = 
    img.id = "input-plan"
    img.alt = "basic-plan"
    return img;
};

/*
window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`)
});
window.api.send("toMain", "some data")
*/
