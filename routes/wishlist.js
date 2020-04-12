const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Wishlist = require("../models/Wishlist");

// @route    POST /v1/wishlist
// @desc     Create Wishlist
// @access   Private
router.post(
  "/v1/wishlist",
  auth,
  [check("place_id", "Place ID is required is required").not().isEmpty()],
  async (req, res) => {
    try {
      let wishlist = Wishlist({
        place_id: req.body.place_id,
      });
      await wishlist.save();
      return res.status(200).json();
    } catch (err) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Wishlist could not be added" }] });
    }
  }
);

module.exports = router;
