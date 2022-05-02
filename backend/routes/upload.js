import Express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { Storage } from "@google-cloud/storage"
import { PubSub } from "@google-cloud/pubsub"
import * as fs from 'fs'; 
import axios from "axios";

//const axios = require('axios')
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pubsub = new PubSub({
  projectId: "pftc00001",
  keyFilename: "./key.json",
})
const upload = Express.Router();
import { validateToken } from "./auth.js";
//storage location
const storage = new Storage({
  projectId: "pftc00001",
  keyFilename: "./key.json",
});
//bucket name
const bucket = "pftc00001.appspot.com";
const uploadToCloud = async(folder,file) =>{
  return await storage.bucket(bucket).upload(file.path,{
    destination: folder + file.originalname,
  });
};


/*
async function downloadFile() {
  const options = {
    destination: destFileName,
  };
  const destFileName = '/local/path/to/file.txt';

  // Downloads the file
  await storage.bucket(bucket).file(__filename).download(options);

  console.log(
    `gs://${bucket}/${__filename} downloaded to ${destFileName}.`
  );
}
*/

const callback = (err,messageId) =>{
  if(err){
    console.log(err);
  }else{
    console.log('It\'s saved!');
  }
};

//pushing stuff in queue
async function publicMessage(payload){
  const dataBuffer = Buffer.from(JSON.stringify(payload),"utf8");
  pubsub.topic("queue").publish(dataBuffer,{},callback);
  
}
//attempt at implementing doc and image to be comverted to pdf
//const document = "document";
//const image = "image";

//this is used for what is being inputed in the upload file section
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
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg" ) {
     //return document
    } else if (ext !== ".doc" && ext !== ".docx"){
      //return image
    }
    callback(null, true);
  },
  limits: {
    fileSize: 4000000,
  },
});
//converts image to base64
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString('base64');
}
// this uploads the file into the server
upload.route("/").post(imageUpload.single("image"), (req, res) => {
  const token = req.headers.cookie.split("token=")[1].split(";")[0];
  validateToken(token)
  .then((r) => {
    const email = r.getPayload().email;
    if (req.file) {
      console.log("File downloaded at: " + req.file.path);
      '';
      //uploads to the pending file
      uploadToCloud("pending/", req.file).then(([r]) =>{
        console.log(r.metadata.mediaLink);

      
        publicMessage({
          email:email,
          filename: req.file.originalname,
          url: r.metadata.mediaLink,
          date: new Date().toUTCString(),
        });

    

        var base64str = base64_encode(req.file.path);
       // console.log(base64str);
       
  if (req.file) {
    uploadToCloud("pending/", req.file).then(([r]) =>{

      publicMessage({
        email:email,
        filename: req.file.originalname,
        url: r.metadata.mediaLink,
        date: new Date().toUTCString(),
      });
      //function download(){
     //   downl(req.file.path);
     // }
      
      console.log(r.metadata.mediaLink);
      //console.log(r.metadata.mediaLink);
    console.log("File downloaded at: " + req.file.path);

    //getoutpdf stuff below
    const data = {
      "api_key": "d142ca2f884cafd91c46695fb50571417a0603f0b46c1897d655aef835ceb5a7",           // string, required
      "image": `${base64str}` ,
      "document":   `${base64str}`  ,       // string, required
     // "transparent_color": "#ffffff" // string, optional, default:#ffffff
     "pdf_base64": ``
    };

    const data1 = {
      "api_key": "d142ca2f884cafd91c46695fb50571417a0603f0b46c1897d655aef835ceb5a7",           // string, required
      //"image": `${base64str}` ,
      "document":   `${base64str}`  ,       // string, required
     // "transparent_color": "#ffffff" // string, optional, default:#ffffff
     "pdf_base64": ``
    };
    //plan was if the data type file is image it will return string and do this for the link ert/'+image||document+'-to
    axios.post('https://getoutpdf.com/api/convert/image-to-pdf',data)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Student Info: ', res.data);
        const myBuffer  = Buffer.from(res.data.pdf_base64,'base64');
        
     storage.bucket("pftc00001.appspot.com").file("completed/" + req.file.originalname.substring
      (0, req.file.originalname.lastIndexOf("convertedfile")) + ".pdf").save(myBuffer);

        },
        //this is for the doc but not working properly .doc files do get uploaded in the server
        axios.post('https://getoutpdf.com/api/convert/document-to-pdf',data1)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Student Info: ', res.data);
        const myBuffer  = Buffer.from(res.data.pdf_base64,'base64');
        //the conversion to pdf is done here and is sent to completed with the file name being .pdf
     storage.bucket("pftc00001.appspot.com").file("completed/" + req.file.originalname.substring
      (0, req.file.originalname.lastIndexOf("convertedfile")) + ".pdf").save(myBuffer);
        }).catch((err) => {
            console.error(err);
           
        }));
  },
  
  //errer and passing checking below
   res.send({
     status: "200",
     base64str:"",
    message: "File uploaded successfully! Processing..",
   }));
  }});
  }
})
.catch((error) =>{
  console.log(error);
});
});
export default upload;