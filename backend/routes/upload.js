import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { Storage } from "@google-cloud/storage"
import { PubSub } from "@google-cloud/pubsub"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pubsub = new PubSub({
  projectId: "pftc00001",
  keyFilename: "./key.json",
})
const upload = Express.Router();
import { validateToken } from "./auth.js";
const storage = new Storage({
  projectId: "pftc00001",
  keyFilename: "./key.json",
});
const bucket = "pftc00001.appspot.com";
const uploadToCloud = async(folder,file) =>{
  return await storage.bucket(bucket).upload(file.path,{
    destination: folder + file.originalname,
  });
};

const callback = (err,messageId) =>{
  if(err){
    console.log(err);
  }
};

async function publicMessage(payload){
  const dataBuffer = Buffer.from(JSON.stringify(payload),"utf8");
  pubsub.topic("queue").publish(dataBuffer,{},callback);
}

let imageUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../uploads/"));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 4000000,
  },
});

upload.route("/").post(imageUpload.single("image"), (req, res) => {
  const token = req.headers.cookie.split("token=")[1].split(";")[0];
  validateToken(token)
  .then((r) => {
    const email = r.getPayload().email;
    if (req.file) {
      console.log("File downloaded at: " + req.file.path);
      '';

      uploadToCloud("pending/", req.file).then(([r]) =>{
        console.log(r.metadata.mediaLink);

       
        publicMessage({
          email:email,
          filename: req.file.originalname,
          url: r.metadata.mediaLink,
          date: new Date().toUTCString(),
        });


        var img2data = (function() {
          'use strict';
          return {
            // this.qS(foo)
            qS: function(el) {
              return document.querySelector(el);
            },
            run: function() {
              this.convert(); 
            },
            convert: function() {
              // vars 
              var fls = this.qS('#files'),
                  output = this.qS('.output'),
                  overlay = this.qS('.overlay'),
                  close_overlay = this.qS('.close_overlay');
              
              fls.addEventListener('change', function(e) {
                var file = fls.files[0],
                    txtType = /text.*/, // all text files
                    imgType = /image.*/, // all image files
                    fR = new FileReader(); // fileReader start
                
                fR.onload = function(e) {
                  // if text 
                  if (file.type.match(txtType)) {
                    var rS = fR.result,
                        // template 
                        render = '<a class="btn" href="'+rS+'" target="blank">Output</a><ul>'+
                          '<li><b>Name: </b>  '+file.name+'</li>'+
                          '<li><b>Size: </b>  '+file.size+'</li>'+
                          '<li><b>Type: </b>  '+file.type+'</li>'+
                          '<li><b>Data uri: </b></li>'+
                        '</ul>'+
                        '<pre class="textarea">'+rS+'</pre>';
                    output.innerHTML = render; 
                  // if image
                  } else if(file.type.match(imgType)) {
                    var rS2 = fR.result,
                        // template
                        tmpl = '<a class="btn" href="'+rS2+'" target="blank">Output</a>'+
                        '<img class="thumb" src="'+rS2+'" alt="'+file.name+'"><ul>'+
                          '<li><b>Name: </b>  '+file.name+'</li>'+
                          '<li><b>Size: </b>  '+file.size+'</li>'+
                          '<li><b>Type: </b>  '+file.type+'</li>'+
                          '<li><b>Data uri: </b></li>'+
                        '</ul>'+
                        '<pre class="textarea">'+rS2+'</pre>';
                    output.innerHTML = tmpl;
                   // if not support
                  }else{
                    output.innerHTML = '<h1>Maaf file yang anda upload tidak mendukung</h1>';
                  }
                };
                
                // on loaded add events
                fR.onloadend = function(e) {
                  overlay.classList.add('show'); // add class
                  close_overlay.onclick = function(){
                    overlay.classList.remove('show'); // remove class
                    fls.value = ''; // remove files
                  };
                };  
                // convert to data uri
                fR.readAsDataURL(file); 
              });
            }
          };
        })();
        
        img2data.run();

  
  if (req.file) {
    console.log("File downloaded at: " + req.file.path);
    //imageToBase64("ianzammit.me");
        //or
        //import imageToBase64 from 'image-to-base64/browser';
        /*
        imageToBase64("pending/", req.file) // Path to the image
            .then(
                (response) => {
                    console.log(response); // "cGF0aC90by9maWxlLmpwZw=="
                }
            )
            .catch(
                (error) => {
                    console.log(error); // Logs an error if there was one
                }
            )
            */
    //Upload to google cloud
    //Convert to base64
    //Send to PDF Conversion API
  }
   res.send({
     status: "200",
    message: "File uploaded successfully! Processing..",
   });
  });
  }
})
.catch((error) =>{
  console.log(error);
});
});
export default upload;