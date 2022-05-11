const express = require("express");

const DocumentController = require("./controller/Document");
const UserController = require("./controller/User");

const auth = require("./util/authorisation");

module.exports = function (app) {
  //initialising api routes
  const apiRoutes = express.Router();

  apiRoutes.get("/", (req, res, next) => {
    res.status(200).json({ dummy: "sample" });
  });
  //********************User Auth APIs**************************

  // apiRoutes.post("/user/signup", UserAuthController.Signup);
  // apiRoutes.post("/user/signin", UserAuthController.Signin);

  //********************User APIs**************************

  apiRoutes.post("/user/save", UserController.NewUser);
  apiRoutes.get("/user/getuser", UserController.ReadUser);
  apiRoutes.delete("/user/deleteuser", UserController.DeleteUser);
  apiRoutes.put("/user/updateuser", UserController.UpdateUser);

  //********************Document APIs**************************
  //Save Document
  apiRoutes.post("/document/save", DocumentController.SaveDocument);
  //Get Document
  apiRoutes.get("/document/get", DocumentController.ReadDocument);
  apiRoutes.get("/document/getphone", DocumentController.ReadDocumentByPhone);
  apiRoutes.post("/document/ocrtojson", DocumentController.OcrToJson);

  apiRoutes.post(
    "/document/addfamily",
    DocumentController.familyMemberMiddleware,
    DocumentController.familyMemberMiddleware2,
    DocumentController.AddFamilyMember
  );

  // Notification API

  const admin = require("firebase-admin");

  const serviceAccount = require("./firebase.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const tokens = [];

  apiRoutes.post("/register", (req, res) => {
    tokens.push(req.body.token);
    res.status(200).json({ message: "Successfully registered FCM Token!" });
  });

  apiRoutes.post("/notifications", async (req, res) => {
    try {
      const { title, body, imageUrl } = req.body;
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title,
          body,
          imageUrl,
        },
      });
      res.status(200).json({ message: "Successfully sent notifications!" });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ message: err.message || "Something went wrong!" });
    }
  });

  app.use("/api", apiRoutes);

  app.use((req, res) => {
    res.status(404).send("Invalid request");
  });
};
