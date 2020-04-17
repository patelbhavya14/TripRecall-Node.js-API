const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const moment = require("moment");
const Trip = require("../models/Trip");
const Attraction = require("../models/Attraction");

// @route    POST /v1/trip/:id/attraction
// @desc     Add Attraction
// @access   Private
router.post(
  "/v1/trip/:id/attraction",
  auth,
  [
    check("place_id", "Place ID is required").not().isEmpty(),
    check("date")
      .custom((value, { req }) => {
        return moment(value, "YYYY-MM-DD", true).isValid();
      })
      .withMessage("Start Date is not valid"),
  ],
  async (req, res) => {
    try {
      let trip = await Trip.findById(req.params.id);

      if (!trip) {
        return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
      }

      const { place_id, date } = req.body;

      // Check whether attraction date is within trip dates
      if (!moment(date).isBetween(trip.start_date, trip.end_date, null, "[]")) {
        return res
          .status(404)
          .json({ errors: [{ msg: "date is out of trip date" }] });
      }

      let attraction = new Attraction({
        trip: req.params.id,
        place_id,
        date,
      });

      await attraction.save();
    } catch (err) {}
  }
);

module.exports = router;
