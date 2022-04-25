"use strict";

const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const database = require("../services/mongodb");
const { IDSIZE, DBERROR } = require("../util/constants");
const jwt = require("jsonwebtoken");

const User = require("../model/userModel");
const Document = require("../model/documentModel");

const { AUTHSECRET } = require("../config/secrets");
const { TOKENEXPIRE } = require("../util/constants");
const { v4: uuidv4 } = require("uuid");

//Create User
exports.NewUser = async function (req, res, next) {
  const { email, password, name, phone } = req.body;
  const userId = uuidv4();
  let user = new User({
    userId: userId,
    email: email,
    password: password,
    name: name,
    phone: phone,
  });

  let documentUpload = new Document({
    userId: userId,
    document: [],
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

//Read User
exports.ReadUser = async function (req, res, next) {
  const query = req.query;
  console.log(query);
  await User.find(query)
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        console.log(user);

        return res.status(200).json(user);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: DBERROR,
      });
    });
};

exports.UpdateUser = async function (req, res, next) {
  const query = req.body;
  await User.updateOne({ userId: query.userId }, { $set: query.newData })
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        // console.log(user);
        return res.status(200).json(user);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: err,
      });
    });
};

exports.DeleteUser = async function (req, res, next) {
  const query = req.body;
  await User.DeleteOne({ userId: query.userId })
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        // console.log(user);
        return res.status(200).json(user);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: DBERROR,
      });
    });
};
