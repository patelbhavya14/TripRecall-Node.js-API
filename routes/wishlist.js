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
      let wishlist = await Wishlist.findOne({
        user: req.user.id,
        place_id: req.body.place_id,
      });

      if (wishlist) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Wishlist already present" }] });
      }

      wishlist = Wishlist({
        user: req.user.id,
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

// @route    DELETE /v1/wishlist/:id
// @desc     Delete Wishlist
// @access   Private
router.delete("/v1/wishlist/:id", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ errors: [{ msg: "Wishlist not found" }] });
    }

    await wishlist.remove();

    return res.status(200).json();
  } catch (err) {}
});

module.exports = router;
