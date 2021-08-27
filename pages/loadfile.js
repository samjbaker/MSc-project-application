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

    window.api.receive("invalidFile", (message) => {
        alert(message);
        return;
    });

    window.api.receive("chosenFile", (temp) => {
        console.log('received file '+temp)
        temp_img = temp
        //change javascript to accept selecting another image
        target = document.getElementById('image-container');
        if(target.children.length > 0){
            updateImage(temp_img, 'input-plan')
        }
        else {
            out = '<img id="input-plan" src="' + temp + '" alt="basic-plan"/>';
            target.innerHTML = out
            createContinueButton();
        }
        //updateImage(temp_img, 'input-plan')
        txt_target = document.getElementById('text-container').textContent = 'Are you happy with this image?';
        return;
      })
}

//Updates an image with the specified image path
function updateImage(path, id)
{
    var pic = document.getElementById(id);
    pic.src = path+"?"+new Date().valueOf();
}

//Old version - keeping just in case
function createContinueButton() {
    var btn_div = document.getElementById('btn-container');
    if (btn_div.children.length >= 2) {
        return;
    }
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"crop.html");
    var button = document.createElement("input");
    button.type = "button";
    button.value = "Continue";
    button.className = "btn btn-success";
    /*
    button.onclick = function cropSetUp() {
        var btn_div = document.getElementById('btn-container');
        btn_div.textContent = '';
        txt_target = document.getElementById('text-container').textContent = 'Does the image need to be cropped to remove unnecessary external details?'
        var yesButton = document.createElement("yes-btn");
        var noButton = document.createElement("no-btn");
        yesButton.type = "button";
        yesButton.value = "Yes";
        yesButton.className = "btn btn-success";
        noButton.type = "button";
        noButton.value = "No";
        noButton.className = "btn btn-danger";
        btn_div.appendChild(yesButton);
        btn_div.appendChild(noButton);
      }
      */
    aTag.appendChild(button);
    btn_div.prepend(aTag);
  }

  function createContinueButton1() {
    var btn_div = document.getElementById('btn-container');
    if (btn_div.children.length >= 2) {
        return;
    }
    var button = document.createElement("continue");
    button.type = "button";
    button.value = "Continue";
    button.className = "btn btn-success";
    btn_div.prepend(button);
    //btn_div.children[0].onclick = cropSetUp();
  }