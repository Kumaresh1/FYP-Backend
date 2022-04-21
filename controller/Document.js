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

//Save Document
exports.SaveDocument = function (req, res, next) {
  const { userId, document } = req.body;
  let documentUpload = new Document({
    userId: userId,
    document: document,
  });

  Document.updateOne({ userId: userId }, { $addToSet: { document: document } })
    .then((val) => {
      if (val == null) {
        throw Error("Error while saving Document");
      } else {
        res.status(201).json({
          message: "Document uploaded successfully",
          payload: val,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: DBERROR,
      });
    });
};

//Read Document
exports.ReadDocument = function (req, res, next) {
  const { userId } = req.query;
  Document.find({ userId: userId })
    .then((document_list) => {
      if (document_list == null) {
        throw Error("Error while reading document");
      } else {
        console.log(document_list);

        return res.status(200).json({
          documents: document_list,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: DBERROR,
      });
    });
};
