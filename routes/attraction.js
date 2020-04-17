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
      let trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });

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

      trip.attractions.push(attraction);
      await trip.save();

      return res.status(200).json(attraction);
    } catch (err) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Attraction could not be added" }] });
    }
  }
);

// @route    POST /v1/trip/:id/attraction/:id
// @desc     Delete Attraction
// @access   Private
router.delete(
  "/v1/trip/:tripId/attraction/:attractionId",
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let trip = await Trip.findOne({
        _id: req.params.tripId,
        user: req.user.id,
      });

      if (!trip) {
        return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
      }

      // Check whether attraction belongs to trip or not
      if (!trip.attractions.includes(req.params.attractionId)) {
        return res
          .status(404)
          .json({ errors: [{ msg: "Attraction not found" }] });
      }

      trip.attractions.pull(req.params.attractionId);
      trip.save();

      let attraction = await Attraction.findById(req.params.attractionId);
      await attraction.remove();

      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res
        .status(404)
        .json({ errors: [{ msg: "Attraction could not be deleted" }] });
    }
  }
);

module.exports = router;
