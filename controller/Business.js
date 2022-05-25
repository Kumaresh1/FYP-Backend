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

exports.searchTopSellingProduct = async (req, res, next) => {
  //find Id of Family Member with Phone

  console.log("Search top product");
  const { seachQuery } = req.body;

  await Document.aggregate([
    { $project: { document: { tags: 1 } } },
    // { $unwind: "$document", $unwind: "$document.tags" },
    // { $group: { _id: "$document.tags", count: { $sum: 1 } } },

    { $unwind: "$document" },

    { $unwind: "$document.tags" },
    {
      $group: {
        _id: "$document.tags",
        count: { $sum: 1 },
      },
    },
  ])
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        console.log(user);
        return res.status(200).json({
          documents: user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: "Family member does not exist",
      });
    });
};
exports.searchTopSellingBrand = async (req, res, next) => {
  //find Id of Family Member with Phone

  const { seachQuery } = req.body;

  await User.findOne({ phone: familyMemberPhone })
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        req.familyMemberId = user.userId;
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: "Family member does not exist",
      });
    });
};
exports.searchTopSellingBrandUnderProduct = async (req, res, next) => {
  //find Id of Family Member with Phone

  const { seachQuery } = req.body;

  await User.findOne({ phone: familyMemberPhone })
    .then((user) => {
      if (user == null) {
        throw Error("Error while reading user");
      } else {
        return res.status(200).json({
          documents: user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(401).json({
        error: "Family member does not exist",
      });
    });
};
exports.searchTopSellingProductUnderBrand = async (req, res, next) => {
  //find Id of Family Member with Phone

  const { seachQuery } = req.body;

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
