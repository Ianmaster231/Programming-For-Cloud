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

       
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
        } else {
          alert('The File APIs are not fully supported in this browser.');
        }
        
        function handleFileSelect(evt) {
          var f = evt.target.files[0]; // FileList object
          var reader = new FileReader();
          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              var binaryData = e.target.result;
              //Converting Binary Data to base 64
              var base64String = window.btoa(binaryData);
              //showing file converted to base64
              document.getElementById('base64').value = base64String;
              alert('File converted to base64 successfuly!\nCheck in Textarea');
            };
          })(f);
          // Read in the image file as a data URL.
          reader.readAsBinaryString(f);
        }



  
  if (req.file) {
    console.log("File downloaded at: " + req.file.path);
 
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