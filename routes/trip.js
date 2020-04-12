const express = require("express");
const router = express.Router();
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

// @route    GET /v1/trip/:id
// @desc     Get trip
// @access   Private
router.get("/v1/trip/:id", auth, async (req, res) => {
  try {
    let trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });

    if (!trip) {
      return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
    }

    return res.status(200).json(trip);
  } catch (err) {
    return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
  }
});

// @route    DELETE /v1/trip/:id
// @desc     Delete trip
// @access   Private
router.delete("/v1/trip/:id", auth, async (req, res) => {
  try {
    let trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });

    if (!trip) {
      return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
    }

    await trip.remove();

    return res.status(200).json();
  } catch (err) {
    return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
  }
});

// @route    PUT /v1/trip/:id
// @desc     Update Trip
// @access   Private
router.put(
  "/v1/trip/:id",
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
    try {
      let trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });

      if (!trip) {
        return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
      }

      // Check if start date is before the actual start date
      if (moment(start_date).isAfter(trip.start_date)) {
        return res.status(400).json({
          errors: [{ msg: "Start date is after the Actual trip start date" }],
        });
      }

      // Check if end date is after the actual end date
      if (moment(end_date).isBefore(trip.end_date)) {
        return res.status(404).json({
          errors: [{ msg: "End date is before the Actual trip end date" }],
        });
      }

      let availableTrips = await Trip.find(
        {
          _id: {
            $ne: req.params.id,
          },
          user: req.user.id,
        },
        "start_date end_date"
      );

      // Check whether there are any conflicts or not
      availableTrips = availableTrips.filter((a) => {
        return (
          moment(start_date).isBetween(a.start_date, a.end_date, null, "[]") ||
          moment(end_date).isBetween(a.start_date, a.end_date, null, "[]")
        );
      });

      if (availableTrips.length > 0) {
        return res
          .status(400)
          .json({ msg: "Your trip is conflicting with one of your trips" });
      }

      trip.trip_name = trip_name;
      trip.place_id = place_id;
      trip.start_date = start_date;
      trip.end_date = end_date;

      await trip.save();

      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errors: [{ msg: "Bad request" }] });
    }
  }
);

module.exports = router;
