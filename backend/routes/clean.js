import Express from "express";
import {Storage} from "@google-cloud/storage";

const bucket = "pftc00001.appspot.com";
const clean = Express.Router();
const storage = new Storage({
   projectId: "pftc00001",
   keyFilename: "./key.json",
 });

 clean.route("/clean").post(async (req,res) => {
   const [filesContent] = await storage.bucket(bucket).getFiles();
   filesContent.forEach(files => {
       if(new Date(files.metadata.timeCreated) < Date.now() - (1000000)){
         files.delete();
       }
   });
});
export default clean;