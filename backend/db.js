import Firestore from "@google-cloud/firestore";
import FieldValue from "@google-cloud/firestore";
import { createHmac } from "crypto";
import Redis from "redis";

export let rclient = new Redis.createClient();
//redis implementation
rclient.on("connect", ()=>{
  console.log("Redis connected!");
  getCredits().then((data) => console.log(JSON.parse(data)));
});
//gets the credits from the server
const getCredits = async() =>{
  return rclient.get("Credits");
}
//setting the values 
const setCredits1 = async(payload) =>{
  return awaitrclient.get("tencredits",JSON.stringify(payload));
}
const setCredits2 = async(payload) =>{
  return awaitrclient.get("twentycredits",JSON.stringify(payload));
}
const setCredits3 = async(payload) =>{
  return awaitrclient.get("thirthycredits",JSON.stringify(payload));
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

export async function reduceCredit(email){
  const docRef = db.collection("userData").doc(email).update({
    credits: FieldValue.increment(parseInt("-1"))
  });
  return true;
}
//creating the userData
export async function CreateClient(email) {
  const docRef = db.collection("userData").doc(email);
  return await docRef.set({
    credits: 10,
    email: email,
    admin: false,
  });
}
//getting the userData
export async function GetClient(email) {
  const docRef = db.collection("userData");
  const snapshot = await docRef.where("email", "==", email).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

  

export function HashPassword(password) {
  const secret = "i<3PfC";
  return createHmac("sha256", password).update(secret).digest("hex");
}
