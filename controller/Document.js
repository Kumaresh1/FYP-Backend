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
  var m = str.match(
    /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
  );
  return m;
}

exports.OcrToJson = function (req, res, next) {
  const ocr = req.body.ocr;

  const strArray = ocr;

  let findDates = [];
  let expiryDate = "";
  var d1, d2;

  strArray.forEach((str) => {
    d1 = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);
    d2 = str.match(/[0-9]{4}([-/ .])[0-9]{2}[-/ .][0-9]{2}/g);

    if (d1) {
      console.log(
        new Date(d1[0].slice(6, 10), d1[0].slice(3, 5), d1[0].slice(0, 2))
      );
      let tempd1 = new Date(
        d1[0].slice(6, 10),
        d1[0].slice(0, 2),
        d1[0].slice(3, 5)
      );
      let curDate = new Date();
      console.log("", tempd1, curDate);

      if (tempd1.getTime() > curDate.getTime()) {
        console.log("greaterrr", tempd1.getTime(), curDate.getTime());
      }
      findDates.push(d1);
    }
    if (d2) {
      findDates.push(d2);
    }
  });

  return res.status(200).json({
    dates: findDates,
  });
};
