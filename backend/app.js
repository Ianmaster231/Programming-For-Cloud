import Express from "express";
import cors from "cors";
import https from "https";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

import auth from "./routes/auth.js";
import upload from "./routes/upload.js";
import home from "./routes/home.js";
import clean from "./routes/clean.js";
import { CreateClient, GetClient } from "./db.js";

const DEV = false;
const PORT = DEV ? 80 : 443;
const SECRET_MANAGER_CERT =
  "projects/1091943997385/secrets/PublicKey/versions/latest";
const SECRET_MANAGER_PK =
  "projects/1091943997385/secrets/PrivateKey/versions/latest";
const SECRET_MANAGER_GET_OUT_PDF =
  "projects/1091943997385/secrets/GetOutPDF/versions/latest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sm = new SecretManagerServiceClient({
  projectId: "pftc00001",
  keyFilename: "./key.json",
});
//api hey
export let PDF_API_KEY = "d142ca2f884cafd91c46695fb50571417a0603f0b46c1897d655aef835ceb5a7";

const startServer = async () => {
  //Load GetOutPDF API Key
  const [pdf] = await sm.accessSecretVersion({
    name: SECRET_MANAGER_GET_OUT_PDF,
  });
  PDF_API_KEY = pdf.payload.data.toString();
  if (!DEV) {
    const [pub] = await sm.accessSecretVersion({
      name: SECRET_MANAGER_CERT,
    });

    const [prvt] = await sm.accessSecretVersion({
      name: SECRET_MANAGER_PK,
    });

    const sslOptions = {
      key: prvt.payload.data.toString(),
      cert: pub.payload.data.toString(),
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log("Secure Server Listening on port:" + PORT);
    });
  } else {
    app.listen(PORT, () => console.log("Server Listening on port: " + PORT));
  }
};

const app = Express();
//enabled http -> https redirection
if (!DEV) {
  app.enable("trust proxy");
  app.use((req, res, next) => {
    req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
  });
}
//serve static files
app.use(Express.static(path.join(__dirname, "../frontend/public")));

//allow cross-origin reqs
app.use(cors());

//route auth traffic to auth.js
app.use("/auth", auth);

//route upload traffic to upload.js
app.use("/upload", upload);
//route home traffic home

app.use("/home", home);

// route clean to clean.js
app.use("/clean",clean);

//Delivering index.html; the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
// page where u buy and download stuff
app.get("/homepage", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});
app.post("/",  async function(req, res) {
  const email = req.query.email;
  console.log(" email  correctly implemented getting user");

  app.post('/', async (req,res) => {
    const email = req.query.Email;
    CreateClient(email).then(async(response) => {
      if(response.length > 0)
        res.send({Credits: response[0].credits, Admin: response[0].admin})
      else{
        const newUser = await CreateClient(email);
        res.send({Credits: newUser.credits, Admin: newUser.admin})
      }
    })
  })

  
  
  app.post('/', async (req,res) => {
    const email = req.query.Email;
    GetClient(email).then(async(response) => {
      if(response.length > 0)
        res.send({Credits: response[0].credits})
    })
  })
});
startServer();
