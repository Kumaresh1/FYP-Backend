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
  "mixie",
  "grinder",
  "fridge",
  "washing Machine",
  "washing",
  "air conditioner",
  "fan",
  "cooker",
];

var BrandTags = ["preethi", "prestige", "lg", "samsung", "butterfly"];

// exports.TotalDocumentsMiddleware = async (req, res, next) => {
//   //find Id of Family Member with Phone

//   console.log("Search top product Middleware");
//   const { seachQuery } = req.body;

//   await Document.aggregate([
//     { $unwind: "$document" },
//     {
//       $match: {
//         "document.type": {
//           $eq: "General",
//         },
//       },
//     },
//     { $group: { _id: "$document", sum: { $sum: 1 } } },
//     { $group: { _id: null, total_sum: { $sum: "$sum" } } },
//   ])
//     .then((data) => {
//       if (data == null) {
//         throw Error("Error while reading data");
//       } else {
//         console.log(data);
//         req.total_sum = data[0].total_sum;
//         next();
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(401).json({
//         error: err,
//       });
//     });
// };

const countTotalProduct = (data) => {
  let count = 0;
  data.forEach((element) => {
    if (ProductTags.includes(element._id)) {
      count += element.count;
    }
  });
  return count;
};

const countTotalBrand = (data) => {
  let count = 0;
  data.forEach((element) => {
    if (BrandTags.includes(element._id)) {
      count += element.count;
    }
  });
  return count;
};
exports.searchTopSellingProduct = async (req, res, next) => {
  //find Id of Family Member with Phone

  console.log("Search top product", req.total_sum);
  const { seachQuery } = req.body;

  await Document.aggregate([
    { $project: { document: { tags: 1 } } },

    { $unwind: "$document" },
    { $unwind: "$document.tags" },
    { $group: { _id: "$document.tags", count: { $sum: 1 } } },
  ])
    .then((data) => {
      if (data == null) {
        throw Error("Error while reading data");
      } else {
        console.log(data);

        const newObject = data.map((item) => {
          if (ProductTags.includes(item._id)) {
            return {
              name: item._id,
              percentage: Math.round(
                (item.count / countTotalProduct(data)) * 100
              ),
              color: "fff",
            };
          } else {
            return;
          }
        });
        console.log("neww", newObject, countTotalProduct(data));
        return res.status(200).json({
          documents: newObject,
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

exports.searchTopSellingBrand = async (req, res, next) => {
  //find Id of Family Member with Phone

  console.log("Search top brand");
  const { seachQuery } = req.body;

  await Document.aggregate([
    { $project: { document: { tags: 1 } } },

    { $unwind: "$document" },
    { $unwind: "$document.tags" },
    { $group: { _id: "$document.tags", count: { $sum: 1 } } },
  ])
    .then((data) => {
      if (data == null) {
        throw Error("Error while reading data");
      } else {
        console.log(data);

        const newObject = data.map((item) => {
          if (BrandTags.includes(item._id)) {
            return {
              name: item._id,
              percentage: Math.round(
                (item.count / countTotalBrand(data)) * 100
              ),
              color: "fff",
            };
          } else {
            return;
          }
        });
        return res.status(200).json({
          documents: newObject,
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
exports.searchTopSellingProductUnderBrand = async (req, res, next) => {
  //find Id of Family Member with Phone

  console.log("Search top product under brand", req.body);
  const { brand } = req.body;

  await Document.aggregate([
    { $project: { document: { tags: 1 } } },

    { $unwind: "$document" },
  ])
    .then((data) => {
      if (data == null) {
        throw Error("Error while reading data");
      } else {
        //console.log(data);
        const AllProductsOfBrand = [];
        data.map((item) => {
          if (item.document.tags.includes(brand)) {
            item.document.tags.map((tag) => {
              if (ProductTags.includes(tag)) {
                AllProductsOfBrand.push(tag);
              }
            });
          }

          // console.log(item);
        });
        const counts = {};

        for (const tag of AllProductsOfBrand) {
          counts[tag] = counts[tag] ? counts[tag] + 1 : 1;
        }

        console.log(counts);
        const productPercentage = [];
        for (const product in counts) {
          productPercentage.push({
            name: product,
            percentage: Math.round(
              (counts[product] / AllProductsOfBrand.length) * 100
            ),
          });
        }
        // console.log("neww", newObject, countTotalProduct(data));
        return res.status(200).json({
          documents: productPercentage,
          total: data,
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

exports.searchTopSellingBrandUnderProduct = async (req, res, next) => {
  //find Id of Family Member with Phone

  console.log("Search top brand under product", req.body);
  const { product } = req.body;

  await Document.aggregate([
    { $project: { document: { tags: 1 } } },

    { $unwind: "$document" },
  ])
    .then((data) => {
      if (data == null) {
        throw Error("Error while reading data");
      } else {
        //console.log(data);
        const AllBrands = [];
        data.map((item) => {
          if (item.document.tags.includes(product)) {
            item.document.tags.map((tag) => {
              if (BrandTags.includes(tag)) {
                AllBrands.push(tag);
              }
            });
          }

          // console.log(item);
        });
        const counts = {};

        for (const tag of AllBrands) {
          counts[tag] = counts[tag] ? counts[tag] + 1 : 1;
        }

        console.log(counts);
        const productPercentage = [];
        for (const product in counts) {
          productPercentage.push({
            name: product,
            percentage: Math.round((counts[product] / AllBrands.length) * 100),
          });
        }
        // console.log("neww", newObject, countTotalProduct(data));
        return res.status(200).json({
          documents: productPercentage,
          total: data,
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
