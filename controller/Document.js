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

var ProductTags = [
  "Mixie",
  "Grinder",
  "Fridge",
  "Washing Machine",
  "Washing",
  "Air conditioner",
  "AC",
  "Fan",
];

var BrandTags = ["Preethi", "Prestige", "LG", "samsung", "butterfly"];

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

  const ocr = document.ocrData || [];
  console.log(ocr);
  const strArray = ocr;

  let expiryDate = "";
  var d1, d2;
  let tags = [];

  strArray.forEach((str) => {
    d1 = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);
    // d2 = str.match(/[0-9]{4}([-/ .])[0-9]{2}[-/ .][0-9]{2}/g);
    //console.log(str);
    if (d1) {
      if (checkExpiry(d1)) {
        //save to expiry dates and append to array
        expiryDate = d1;
      }
    } else {
      // tag = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);

      //let Ocrstr = "mmmixie grinder";
      //  console.log(str, "tag");
      BrandTags.forEach((tag) => {
        var re = new RegExp(tag, "i");
        let ans = str.search(re);
        // console.log(str, re);
        if (ans > -1) {
          tags.push(tag);
        }
      });
      ProductTags.forEach((tag) => {
        var re = new RegExp(tag, "i");
        let ans = str.search(re);
        if (ans > -1) {
          tags.append(tag);
        }
      });
    }
  });
  console.log("tags detected", tags, expiryDate);
  Document.updateOne(
    { userId: userId },
    {
      $addToSet: { document: document },
      $set: { expiry_date: expiryDate, tags: tags, type: document.type },
    }
  )
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

function parseDate() {
  str = "12/12/2022";
  let date1 = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);
  var d1 = Date.parse("2012-11-01");
  var d2 = Date.parse("2012-11-04");
  if (d1 < d2) {
    alert("Error!");
  }
}

function checkExpiry(date) {
  let ocrDate = date[0];
  console.log(ocrDate, "hi");
  let d1 = ocrDate.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);

  var dt1 = Date.parse("2022-05-21");
  var dt2 = Date.parse(
    d1[0].slice(6, 10) + "-" + d1[0].slice(3, 5) + "-" + d1[0].slice(0, 2)
  );
  console.log(dt1 < dt2);
  if (dt1 < dt2) {
    return true;
  } else {
    return false;
  }
}

exports.OcrToJson = function (req, res, next) {
  const ocr = req.body.ocrData;
  const strArray = ocr;

  let expiryDate = "";
  var d1, d2;
  let tags = [];

  strArray.forEach((str) => {
    d1 = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);
    // d2 = str.match(/[0-9]{4}([-/ .])[0-9]{2}[-/ .][0-9]{2}/g);

    if (d1) {
      if (checkExpiry(d1[0])) {
        //save to expiry dates and append to array
        expiryDate = d1;
      }
    } else {
      tag = str.match(/[0-9]{2}([-/ .])[0-9]{2}[-/ .][0-9]{4}/g);

      let Ocrstr = "mmmixie grinder";

      BrandTags.forEach((tag) => {
        var re = new RegExp(tag, "i");
        let ans = str.search(re);
        if (ans > -1) {
          tags.append(tag);
        }
      });
    }
  });

  return res.status(200).json({
    dates: findDates,
  });
};
