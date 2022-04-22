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

const pdfToCloud = async(folder,file) =>{
  return await storage.bucket(bucket).upload(file.path,{
    destination: folder +file.originalname,
  });
};

const callback = (err,messageId) =>{
  if(err){
    console.log(err);
  }else{
    console.log('It\'s saved!');
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
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg"&& ext !== ".pdf") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 4000000,
  },
});
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString('base64');
}
/*
function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
*/

/*
function base64_transform(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString('byte');
}
*/
//const axios = require('axios');



/*
request.post({
  "api_key": "97b5d164e4324c621c17865d6d8ee1dd6df6852dcf671da22b6710a40aecc425",           // string, required
  "image": base64str,             // string, required
  "transparent_color": "default:#ffffff",  // string, optional, default:#ffffff
  url:     'https://getoutpdf.com/api/convert/image-to-pdf',
  
}, function(error, response, body){
  console.log(body);
});
console.log(post);
*/
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

      // var bytestr = base64_transform(req.file.path);
       // console.log(bytestr);
       //var byteconv = _base64ToArrayBuffer(res.data.pdf_base64) ;
       //console.log(byteconv);

        var base64str = base64_encode(req.file.path);
       // console.log(base64str);
       
  if (req.file) {
    pdfToCloud("completed/", req.file).then(([r]) =>{

      publicMessage({
        email:email,
        filename: req.file.originalname,
        url: r.metadata.mediaLink,
        date: new Date().toUTCString(),
      });
      function download(){
        downl(req.file.path);
      }
      
      console.log(r.metadata.mediaLink);
      console.log(r.metadata.mediaLink);
    console.log("File downloaded at: " + req.file.path);
    const data = {
      "api_key": "7ede2e73eac14d4d38604119892a925be336bdf0de14442fd2c7499c6be0b1eb",           // string, required
      "image": `${base64str}` ,           // string, required
     // "transparent_color": "#ffffff" // string, optional, default:#ffffff
     "pdf_base64": ``
    };
    
   
    axios.post('https://getoutpdf.com/api/convert/image-to-pdf',data)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Student Info: ', res.data);
            //console.log(Buffer.from(res.data.pdf_base64,'base64'.toString('ascii')));
            //const convs = new Uint8Array((Buffer.from(res.data.pdf_base64)));
           // fs.writeFile('conversion.pdf',data,callback)
          // var byteconv = _base64ToArrayBuffer(res.data.pdf_base64) ;
          
         // var conversion = myBuffer+'.pdf';
          //console.log(conversion);
          //const fs = require('fs')
          //var fs = require('fs'); '../backend/uploads/'+
 
        // writeFile function with filename, content and callback function
        const myBuffer  = Buffer.from(res.data.pdf_base64,'base64');
       // fs.writeFile('newfile.pdf', myBuffer,'binary', function (err) {
        //  if (err) throw err;
          //console.log(uploadToCloud);
       // });

        fs.writeFile('result_base64.pdf', myBuffer, 'base64', error => {
          if (error) {
              throw error;
          } else {
              console.log('base64 saved!');
          }
      });

      
         // var fileName = "test.pdf";
          //var a = document.createElement("a");
          //document.body.appendChild(a)
         // a.href = fileUrl;
         // a.download = fileName;
            console.log(myBuffer);
       //console.log(byteconv);
            //console.log(convs);
        }).catch((err) => {
            console.error(err);
            //console.log(post);
        });
        
   // function to encode file data to base64 encoded string
  
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
  },
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