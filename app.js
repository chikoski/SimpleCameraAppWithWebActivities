var el = {};
var ctx;
var preview;
var storage;

function sendPickRequest(){
  console.log("send");
  return new Promise((resolve, reject) =>{
    var req = new MozActivity({
      name: "pick",
      data: {
        type: "image/jpeg"
      }
    });
    req.onsuccess = function(){
      resolve(this.result);
    };
    req.onerror = function(){
      reject(this.error);
    };
  });
}

function loadImage(picture){
  return new Promise((resolve, reject) =>{
    var handler = function(){
      resolve(el.buffer);
      el.buffer.removeEventListener("load", handler);
    };
    el.buffer.src = window.URL.createObjectURL(picture.blob);
    el.buffer.addEventListener("load", handler);
  });
}

function createPreview(picture){
  var size = Math.min(picture.width, picture.height);
  return {
    picture: picture,
    x: 0, 
    y: 0,
    width: size,
    height: size
  };
}

function updatePreview(preview){
  ctx.drawImage(preview.picture, 
                preview.x,
                preview.y,
                preview.width,
                preview.height,
                0, 0, 
                el.canvas.width, 
                el.canvas.height);
}

function showPickedImage(picture){
  preview = createPreview(picture);
  updatePreview(preview);
}

function showError(error){
}

function pickImage(){
  sendPickRequest().then(loadImage).then(showPickedImage);
}

var createFilename = function(){
  return "handson-" + (new Date()).valueOf() + ".jpg";
};

function saved(result){
  var msg = "保存されました";
  new Notification(msg);
}

function saveFailed(error){
  var msg = "保存に失敗しました";
  new Notification(msg);
}

function write(blob, name){
  return new Promise((resolve, reject) =>{
    if(storage){
      console.log("saving image as " + name);
      var req = storage.addNamed(blob, name);
      console.log(req);
      req.onsuccess = function(){
        console.log(this.result);
        resolve(this.result);
      };
      req.onerror = function(){
        reject(this.error);
      };
    }else{
      reject("no storage is available");
    }
  });
}

function createBlob(){
  return new Promise((resolve, reject) =>{
    el.canvas.toBlob(resolve, "image/jpeg");
  });
}

function saveImage(){
  createBlob().then(blob => {
    return write(blob, createFilename());
  }).then(saved).catch(saveFailed);
}

window.addEventListener("load", function() {
  el = {
    pick: document.querySelector("[data-role=pick]"),
    canvas: document.querySelector("canvas"),
    save: document.querySelector("[data-role=save]"),
    buffer: document.querySelector("#buffer")
  };

  el.pick.addEventListener("click", pickImage);
  el.save.addEventListener("click", saveImage);

  ctx = el.canvas.getContext("2d");

  storage = navigator.getDeviceStorage("pictures");
});
