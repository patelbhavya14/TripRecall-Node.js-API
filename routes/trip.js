const express = require("express");
const router = express.Router();
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const moment = require("moment");
const Trip = require("../models/Trip");

// @route    POST /v1/trip
// @desc     Create Trip
// @access   Private
router.post(
  "/v1/trip",
  auth,
  [
    check("trip_name", "Name is required").not().isEmpty(),
    check("place_id", "Place ID is required").not().isEmpty(),
    check("start_date")
      .custom((value, { req }) => {
        return moment(value, "YYYY-MM-DD", true).isValid();
      })
      .withMessage("Start Date is not valid"),
    check("end_date")
      .custom((value, { req }) => {
        return moment(value, "YYYY-MM-DD", true).isValid();
      })
      .withMessage("End Date is not valid")
      .custom((value, { req }) => {
        return req.body.start_date <= value;
      })
      .withMessage("Start Date must come before End date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { trip_name, place_id, start_date, end_date } = req.body;

    let available = await Trip.find(
      {
        user: req.user.id,
      },
      "start_date end_date"
    );

    // Check whether there are any conflicts or not
    available = available.filter((a) => {
      return (
        moment(start_date).isBetween(a.start_date, a.end_date, null, "[]") ||
        moment(end_date).isBetween(a.start_date, a.end_date, null, "[]")
      );
    });

    if (available.length > 0) {
      return res
        .status(400)
        .json({ msg: "Your trip is conflicting with one of your trips" });
    }

    try {
      let trip = new Trip({
        user: req.user.id,
        trip_name,
        place_id,
        start_date,
        end_date,
      });

      await trip.save();

      return res.status(201).json(trip);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errors: [{ msg: "Bad request" }] });
    }
  }
);

// @route    GET /v1/trips
// @desc     Get all trips
// @access   Private
router.get("/v1/trips", auth, async (req, res) => {
  try {
    let trips = await Trip.find({ user: req.user.id });
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(400).json({ errors: [{ msg: "Bad request" }] });
  }
});

module.exports = router;
