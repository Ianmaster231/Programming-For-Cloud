import Firestore from "@google-cloud/firestore";
import { createHmac } from "crypto";
import Redis from "redis";

export let rclient = new Redis.createClient();

rclient.on("connect", ()=>{
  console.log("Redis connected!");
  getCredits().then((data) => console.log(JSON.parse(data)));
});

const getCredits = async() =>{
  return rclient.get("credits");
}

const setCredits = async(payload) =>{
  return awaitrclient.get("credits",JSON.stringify(payload));
}
//Instantiating Firestore with project details
const db = new Firestore({
  projectId: "pftc00001",
  keyFilename: "./key.json",
});

//Collection (Table)
//Document (Row)
//docRef selects the collection
export async function AddDocument(collection, data) {
  const docRef = db.collection(collection).doc();
  return await docRef.set(data);
}

export async function GetDocument(collection, valueType, value) {
  const docRef = db.collection(collection);
  const snapshot = await docRef.where(valueType, "==", value).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

export async function CreateClient(email){
  const docRef = db.collection("userData").doc;
  return await docRef.set({
    email: email,
    admin: false,
    credits:10,
    
  });
}

export function HashPassword(password) {
  const secret = "i<3PfC";
  return createHmac("sha256", password).update(secret).digest("hex");
}
