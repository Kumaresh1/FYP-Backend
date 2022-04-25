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
const userModel = require("../model/userModel");

exports.familyMemberMiddleware = async (req, res, next) => {
  //find Id of Family Member with Phone

  const { familyMemberPhone } = req.body;

  await User.findOne({ phone: familyMemberPhone })
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        req.familyMemberId = user.userId;
        console.log("MW1", req.familyMemberId);
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: "Family member does not exist",
      });
    });
};

exports.familyMemberMiddleware2 = async (req, res, next) => {
  const { userId } = req.body;
  //Find this users Documents to give access
  await Document.findOne({ userId: userId })
    .then((doc) => {
      if (doc == null) {
        throw Error("Error while reading doc");
      } else {
        console.log("MW2", doc);
        req.docList = doc;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: err,
      });
    });
};
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

exports.AddFamilyMember = async function (req, res, next) {
  const { userId } = req.body;
  const familyMemberId = req.familyMemberId;
  const newDocuments = req.docList;
  console.log(familyMemberId, newDocuments);
  Document.updateOne(
    { userId: familyMemberId },
    { $addToSet: { document: newDocuments } }
  )
    .then((val) => {
      if (val == null) {
        throw Error("Error while saving Document");
      } else {
        console.log(val);
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
exports.ReadDocument = async function (req, res, next) {
  //console.log(req.query, req.params);
  const query = req.query;
  await Document.find(query)
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

exports.ReadDocumentByPhone = function (req, res, next) {
  //console.log(req.query, req.params);
  const { phone } = req.query;
  userModel
    .aggregate([
      { $match: { phone: phone } },
      {
        $lookup: {
          from: "documents",
          localField: "userId",
          foreignField: "userId",
          as: "documents_output",
        },
      },
      {
        $unwind: "$documents_output",
      },
    ])
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
        error: err,
      });
    });
};

function parseDate(str) {
  var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(m[3], m[2] - 1, m[1]) : null;
}

exports.OcrToJson = function (req, res, next) {
  //console.log(req.query, req.params);
  const ocr = req.body.ocr;
  let findDates = parseDate(ocr);
  return res.status(200).json({
    dates: findDates,
  });
};
