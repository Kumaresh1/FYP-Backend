const express = require("express");

const DocumentController = require("./controller/Document");
const BusinessController = require("./controller/Business");
const UserController = require("./controller/User");
const DataController = require("./controller/LoadData");

const auth = require("./util/authorisation");
const mongoose = require("mongoose");

const User = require("./model/userModel");
const Document = require("./model/documentModel");
const ExpiryDatesModel = require("./model/expiryDateModel");
const { timeout } = require("nodemon/lib/config");

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
  apiRoutes.post(
    "/document/save",
    DocumentController.SaveDocument,
    DocumentController.AddExpiryDate
  );
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

  //Business

  apiRoutes.get(
    "/searchtopproduct",
    BusinessController.searchTopSellingProduct
  );

  apiRoutes.get("/searchtopbrand", BusinessController.searchTopSellingBrand);
  apiRoutes.get(
    "/searchtopproductunderbrand",
    BusinessController.searchTopSellingProductUnderBrand
  );
  apiRoutes.get(
    "/searchtopbrandunderproduct",
    BusinessController.searchTopSellingBrandUnderProduct
  );
  apiRoutes.get("/loaddata", DataController.LoadData);
  apiRoutes.get("/recommend", BusinessController.recommendations);

  // DataController.loadDataset();

  // Notification API

  const admin = require("firebase-admin");

  const serviceAccount = require("./firebase.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  var ExpiryDates = [];

  const ReadExpiryDates = async function () {
    const query = {};

    await ExpiryDatesModel.find({})
      .then((datesarr) => {
        if (datesarr == null) {
          throw Error("Error while reading user");
        } else {
          ExpiryDates = datesarr[0].expiry_dates;
          //   console.log("Fetched dates ->> ", ExpiryDates);
          //  return res.status(200).json(datesarr);
        }
      })
      .catch((err) => {
        console.log(err);
        // res.status(401).json({
        //   error: DBERROR,
        // });
      });
  };

  const InitExpiryDates = async function () {
    const query = {};

    let ExpiryDatesUpload = new ExpiryDatesModel({
      userId: "",
      expiryDates: [],
    });

    await ExpiryDatesUpload.save()
      .then((datesarr) => {
        if (datesarr == null) {
          throw Error("Error while reading user");
        } else {
          // ExpiryDates = datesarr[0].expiry_dates;
          //  return res.status(200).json(datesarr);
        }
      })
      .catch((err) => {
        console.log(err);
        // res.status(401).json({
        //   error: DBERROR,
        // });
      });
  };

  // setTimeout(() => {
  //   InitExpiryDates();
  // }, 1000);

  setInterval(() => {
    ReadExpiryDates();
  }, 30000);

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
          // console.log("Register", fcm_token, user);
          res.status(200).json(user);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          error: err,
        });
      });
    //res.status(200).json({ message: "Successfully registered FCM Token!" });
  });

  const notificationMiddleware = async (req, res, next) => {
    const { userId } = req.body;

    await User.findOne({ userId: userId })
      .then((user) => {
        if (user == null) {
          throw Error("Error while reading user");
        } else {
          req.fcm_token = user.fcm_token;
          // console.log("MW1", req.body);
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

  const getToken = async (userId) => {
    await User.findOne({ userId: userId })
      .then((user) => {
        if (user == null) {
          throw Error("Error while reading user");
        } else {
          //req.fcm_token = user.fcm_token;
          // console.log("getToken->>", user.name);
          if (user.fcm_token) {
            return user;
          }
          return user.name;
        }
      })
      .catch((err) => {
        console.log(err);
        // res.status(401).json({
        //   error: "User does not exist",
        // });
      });
  };

  setInterval(async () => {
    ExpiryDates.forEach(async (element) => {
      let ocrDate = element.expiry_date;

      // console.log(ocrDate);
      let d1 = ocrDate.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);

      var dt1 = Date.parse("2022-05-26");
      var dt2 = Date.parse(
        d1[0].slice(6, 10) + "-" + d1[0].slice(3, 5) + "-" + d1[0].slice(0, 2)
      );
      if (dt1 - dt2 == 0) {
        console.log("send notification-same day");
        let token;

        await User.findOne({ userId: element.userId })
          .then((user) => {
            if (user == null) {
              throw Error("Error while reading user");
            } else {
              //req.fcm_token = user.fcm_token;
              sendNotification({
                fcm_token: user.fcm_token || user.name,
                title: element.name + " Document is going to expire today",
                body: "Due date " + element.expiry_date,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            // res.status(401).json({
            //   error: "User does not exist",
            // });
          });
      } else if (dt1 - dt2 >= -604800000 && dt1 - dt2 < 0) {
        // console.log("send notification-same week");
        let token;

        await User.findOne({ userId: element.userId })
          .then((user) => {
            if (user == null) {
              throw Error("Error while reading user");
            } else {
              //req.fcm_token = user.fcm_token;
              //console.log("here", user);
              sendNotification({
                fcm_token: user.fcm_token || user.name,
                title: element.name + " Document is going to expire this week",
                body: "Due date " + element.expiry_date,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            // res.status(401).json({
            //   error: "User does not exist",
            // });
          });
      } else if (dt1 - dt2 >= -2592000000 && dt1 - dt2 < 0) {
        console.log("send notification-same month");
        let token;

        await User.findOne({ userId: element.userId })
          .then((user) => {
            if (user == null) {
              throw Error("Error while reading user");
            } else {
              //req.fcm_token = user.fcm_token;
              // console.log("here", user);
              sendNotification({
                fcm_token: user.fcm_token || user.name,
                title:
                  element.name + " Document is going to expire this month ",
                body: "Due date " + element.expiry_date,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            // res.status(401).json({
            //   error: "User does not exist",
            // });
          });
      }
    });
  }, 4000000);

  // setTimeout(async () => {
  //   ExpiryDates.forEach(async (element) => {
  //     let ocrDate = element.expiry_date;

  //     console.log(ocrDate);
  //     let d1 = ocrDate.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);

  //     var dt1 = Date.parse("2022-05-26");
  //     var dt2 = Date.parse(
  //       d1[0].slice(6, 10) + "-" + d1[0].slice(3, 5) + "-" + d1[0].slice(0, 2)
  //     );
  //     if (dt1 - dt2 >= -2592000000 && dt1 - dt2 < 0) {
  //       console.log("send notification-same month");
  //       let token;

  //       await User.findOne({ userId: element.userId })
  //         .then((user) => {
  //           if (user == null) {
  //             throw Error("Error while reading user");
  //           } else {
  //             //req.fcm_token = user.fcm_token;
  //             sendNotification({
  //               fcm_token: user.fcm_token || user.name,
  //               title: element.name + " Document is going to expire this week ",
  //               body: "Due date " + element.expiry_date,
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           // res.status(401).json({
  //           //   error: "User does not exist",
  //           // });
  //         });
  //     } else if (dt1 - dt2 >= -604800000 && dt1 - dt2 < 0) {
  //       console.log("send notification-same week");
  //       let token;

  //       await User.findOne({ userId: element.userId })
  //         .then((user) => {
  //           if (user == null) {
  //             throw Error("Error while reading user");
  //           } else {
  //             //req.fcm_token = user.fcm_token;
  //             sendNotification({
  //               fcm_token: user.fcm_token || user.name,
  //               title: element.name + " Document is going to expire this Month",
  //               body: "Due date " + element.expiry_date,
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           // res.status(401).json({
  //           //   error: "User does not exist",
  //           // });
  //         });
  //     } else if (dt1 - dt2 == 0) {
  //       console.log("send notification-same day");
  //       let token;

  //       await User.findOne({ userId: element.userId })
  //         .then((user) => {
  //           if (user == null) {
  //             throw Error("Error while reading user");
  //           } else {
  //             //req.fcm_token = user.fcm_token;
  //             sendNotification({
  //               fcm_token: user.fcm_token || user.name,
  //               title: element.name + " Document is going to expire today",
  //               body: "Due date " + element.expiry_date,
  //             });
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           // res.status(401).json({
  //           //   error: "User does not exist",
  //           // });
  //         });
  //     }
  //   });
  // }, 40000);

  apiRoutes.post("/notifications", notificationMiddleware, async (req, res) => {
    try {
      const { title, body, imageUrl } = req.body;
      let userToken = [req.fcm_token];
      // await admin.messaging().sendMulticast({
      //   userToken,
      //   notification: {
      //     title,
      //     body,
      //     imageUrl,
      //   },
      // });
      res.status(200).json({ message: "Successfully sent notifications!" });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ message: err.message || "Something went wrong!" });
    }
  });

  const sendNotification = async (obj) => {
    try {
      const { title, body, imageUrl } = obj;
      let tokens = [obj.fcm_token];

      // console.log("send notification", obj);
      if (tokens.length > 0) {
        await admin.messaging().sendMulticast({
          tokens,
          notification: {
            title: obj.title,
            body: obj.body,
            imageUrl,
          },
        });
      }
      // console.log("success");
      // res.status(200).json({ message: "Successfully sent notifications!" });
    } catch (err) {
      console.log(err);
      //   res
      //     .status(err.status || 500)
      //     .json({ message: err.message || "Something went wrong!" });
    }
  };

  // sendNotification({
  //   fcm_token:
  //     "dqgfmhRZT3yu7tgV-Y0l_S:APA91bEPTLfjgUeGMGocbm1z8Ua8nknqVczYffhCRwlUV_Ravmc9nhjOXIOxwHmAGZzecyxkg3vBII0eFkWHgZW4DSHzIZPixFUQGO8ReTsZwPkTMMzXg3la9kH7nujk7FaIQSZkfZLE",
  //   title: "Mani masss",
  //   body: "mass mani",
  // });
  app.use("/api", apiRoutes);

  app.use((req, res) => {
    res.status(404).send("Invalid request");
  });
};
