const express = require("express");

const DocumentController = require("./controller/Document");
const UserController = require("./controller/User");

const auth = require("./util/authorisation");

const User = require("./model/userModel");

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

  const ExpiryDates = [
    { userId: "d280b3e2-0a8b-494f-85ae-b67b45928d79", expiryDate: "" },
  ];
  apiRoutes.post("/register", async (req, res) => {
    // tokens.push(req.body.token);
    const { userId, fcm_token } = req.body;
    let fcmToken = { fcm_token: fcm_token };
    await User.updateOne({ userId: userId }, { $set: fcmToken })
      .then((user) => {
        if (user == null) {
          throw Error("Error while reading user");
        } else {
          // console.log(user);
          res.status(200).json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          error: err,
        });
      });
    res.status(200).json({ message: "Successfully registered FCM Token!" });
  });

  const notificationMiddleware = async (req, res, next) => {
    //find Id of Family Member with Phone

    const { userId } = req.body;

    await User.findOne({ userId: userId })
      .then((user) => {
        if (user == null) {
          throw Error("Error while reading user");
        } else {
          req.fcm_token = user.fcm_token;
          console.log("MW1", req.body);
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          error: "User does not exist",
        });
      });
  };

  apiRoutes.post("/notifications", notificationMiddleware, async (req, res) => {
    try {
      const { title, body, imageUrl } = req.body;
      let userToken = [req.fcm_token];
      await admin.messaging().sendMulticast({
        userToken,
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
