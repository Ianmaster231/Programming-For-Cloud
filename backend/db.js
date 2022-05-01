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

const setCredits1 = async(payload) =>{
  return awaitrclient.get("credits10",JSON.stringify(payload));
}
const setCredits2 = async(payload) =>{
  return awaitrclient.get("credits20",JSON.stringify(payload));
}
const setCredits3 = async(payload) =>{
  return awaitrclient.get("credits30",JSON.stringify(payload));
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

export async function GetClient(email) {
  const docRef = db.collection(email);
  const snapshot = await docRef.where(email, "==", email).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

async function publicMessage(payload){
  const dataBuffer = Buffer.from(JSON.stringify(payload),"utf8");
  pubsub.topic("queue").publish(dataBuffer,{},callback);
}


export async function CreateClient(email){
  publicMessage({
    credits:10,
    email: email,
    admin: false,

  });
    return await AddDocument("userData", {credits: 10, email: email, admin: false  });
}

export function HashPassword(password) {
  const secret = "i<3PfC";
  return createHmac("sha256", password).update(secret).digest("hex");
}
