
import Express from "express";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID =
  "1091943997385-5rj2tq9kpf626isv730h78bkcmlrlf88.apps.googleusercontent.com";
const auth = Express.Router();
const client = new OAuth2Client(CLIENT_ID);

export default auth;

auth.route("/login").post((req, res) => {
  const token = req.query.token;
  validateToken(token)
    .then((ticket) => {
      if (ticket) {
        const payload = ticket.getPayload();
        res.send({
          status: "200",
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          token: token,
          expiry: payload.exp,
        });
      } else {
        res.send({ status: "401" });
      }
    })
    .catch((error) => {
      console.log("Token expired");
      res.send({ status: "401" });
    });
});

export const validateToken = async (token) => {
  return await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
};
