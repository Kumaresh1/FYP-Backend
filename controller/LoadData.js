const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const database = require("../services/mongodb");
const { IDSIZE, DBERROR } = require("../util/constants");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const Document = require("../model/documentModel");
const { AUTHSECRET } = require("../config/secrets");
const { TOKENEXPIRE } = require("../util/constants");
const userModel = require("../model/userModel");
const { v4: uuidv4 } = require("uuid");
var ProductTags = [
  "mixie",
  "grinder",
  "fridge",
  "washing machine",
  "washing",
  "air conditioner",
  "fan",
  "cooker",
  "tv",
  "television",
  "mobile",
  "phone",
];

var BrandTags = [
  "preethi",
  "prestige",
  "lg",
  "samsung",
  "butterfly",
  "onida",
  "hitachi",
  "phillips",
  "haier",
  "bajaj",
  "usha",
  "pigeon",
];

exports.LoadData = async function (req, res, next) {
  const { email, password, name, phone, userType } = {
    email: uuidv4() + "@gmail.com",
    password: uuidv4(),
    name: nanoid(6),
    phone: nanoid(10),
    userType: "normal",
  };

  const userId = uuidv4();
  let user = new User({
    userId: userId,
    email: email,
    password: password,
    name: name,
    phone: phone,
    userType: userType,
  });

  var generatedTags = [],
    generatedDocument = [];

  for (let index = 0; index < 3; index++) {
    generatedTags.push(
      ProductTags[Math.floor(Math.random() * ProductTags.length)]
    );
    generatedTags.push(
      BrandTags[Math.floor(Math.random() * ProductTags.length)]
    );
    generatedDocument.push({ name: "dataset", tags: generatedTags });
    generatedTags = [];
  }

  console.log(generatedDocument);
  let documentUpload = new Document({
    userId: userId,
    document: generatedDocument,
  });

  documentUpload
    .save()
    .then((val) => {
      if (val == null) {
        throw Error("Error while saving Document");
      } else {
        // res.status(201).json({
        //   message: "Document created successfully",
        //   payload: val,
        // });
      }
    })
    .catch((err) => {
      console.log(err);
      // res.status(401).json({
      //   error: DBERROR,
      // });
    });

  await user
    .save()
    .then((val) => {
      if (val == null) {
        throw Error("Error while setting user account");
      } else {
        res.status(201).json({
          message: "user account successfully created",
          payload: val,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: err,
      });
    });
};

exports.loadDataset = async () => {
  console.log("Load Data ->> ");
  for (let index = 0; index < 1000; index++) {
    const id = uuidv4().toString();
    const { email, password, name, phone, userType } = {
      email: id + "@gmail.com",
      password: id,
      name: id,
      phone: nanoid(10),
      userType: "normal",
    };

    const userId = uuidv4();
    let user = new User({
      userId: userId,
      email: email,
      password: password,
      name: name,
      phone: phone,
      userType: userType,
    });

    var generatedTags = [],
      generatedDocument = [];

    for (let index = 0; index < 3; index++) {
      generatedTags.push(
        ProductTags[Math.floor(Math.random() * ProductTags.length)]
      );
      generatedTags.push(
        BrandTags[Math.floor(Math.random() * ProductTags.length)]
      );
      generatedDocument.push({ name: "dataset", tags: generatedTags });
      generatedTags = [];
    }

    // console.log(generatedDocument);
    let documentUpload = new Document({
      userId: userId,
      document: generatedDocument,
    });

    documentUpload
      .save()
      .then((val) => {
        if (val == null) {
          throw Error("Error while saving Document");
        } else {
          // res.status(201).json({
          //   message: "Document created successfully",
          //   payload: val,
          // });
        }
      })
      .catch((err) => {
        console.log(err);
        // res.status(401).json({
        //   error: DBERROR,
        // });
      });

    await user
      .save()
      .then((val) => {
        if (val == null) {
          throw Error("Error while setting user account");
        } else {
          //   res.status(201).json({
          //     message: "user account successfully created",
          //     payload: val,
          //   });
          console.log("userAdded", index);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          error: err,
        });
      });
  }
};
