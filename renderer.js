// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let im_path, target, temp_img, out
//dealing with selecting file
document.getElementById('choose-file').onclick = function clickEvent(e) {
    e.preventDefault();
    window.api.send("chooseFile");

    window.api.receive("chosenFile", (temp) => {
        temp_img = temp
        out = '<img id="input-plan" src="' + temp + '" alt="basic-plan"/>';
        //console.log(out);
        target = document.getElementById('image-container');
        target.innerHTML = out
        /*
        out = createImage(temp);
        target = document.getElementById('image-container');
        target.appendChild(out);
        */
      })
    return;
}


//dealing with sending and receiving co-ordinates of picture on click
document.getElementById('image-container').onclick = function clickEvent(e) {
    // e = Mouse click event.
    e.preventDefault()
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.
    console.log("Left? : " + x + " ; Top? : " + y + ".");
    //flood_fill(x, y);
    //Sending co-ords to main.js
    window.api.send("toMain", [x.toString(), y.toString()])
    window.api.receive("fromMain", (data) => {
        console.log(`${data} main process`)
        //console.log(data)
        im_path = data
        //setTimeout(() => {    updateImage(im_path, 'image-container'), 2000 })
        //updateImage(im_path)
        console.log(im_path)
        //setTimeout(() => {    updateImage(im_path, 'image-container'), 2000 })
        updateImage(im_path, 'image-container')
    });
    /*
   out = '<img id="input-plan" src="./image_processing/temp_images/temp1.jpg" alt="basic_plan">'
   target = document.getElementById('image-container');
   target.innerHTML = out*/
   //updateImage(im_path, 'image-container');
}

function updateImage(path, id)
{
   /*
    target = document.getElementById(id);
    var content = target.innerHTML;
    console.log(content)
    target.innerHTML = content;
    console.log(refreshed);
    */
    var pic = document.getElementById('input-plan');
    console.log("Pic: "+ pic.src)
    pic.src = path+"?"+new Date().valueOf();
    /*
    temp_img = path
    var d = new Date();
    var img_path = path + d.getMilliseconds().toString();
    console.log(img_path)
    out = '<img id="input-plan" src="' + img_path + '" alt="basic-plan"/>';
    target = document.getElementById(id);
    target.innerHTML = out;*/
}