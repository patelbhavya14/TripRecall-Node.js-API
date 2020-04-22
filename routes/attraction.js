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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

// @route    GET /v1/trip/:tripId/attractions
// @desc     Get all attraction
// @access   Private
router.get("/v1/trip/:tripId/attractions", auth, async (req, res) => {
  try {
    let trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.user.id,
    });

    if (!trip) {
      return res.status(404).json({ errors: [{ msg: "Trip not found" }] });
    }

    let attractions = await Attraction.find({ trip: req.params.tripId })
      .sort({
        start_time: 1,
      })
      .select("-note");

    return res.status(200).json(attractions);
  } catch (err) {
    return res
      .status(404)
      .json({ errors: [{ msg: "Could not get attractions" }] });
  }
});

// @route    POST /v1/trip/:tripId/attraction/:attractionId
// @desc     Update attraction
// @access   Private
router.put(
  "/v1/trip/:tripId/attraction/:attractionId",
  auth,
  async (req, res) => {
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

      let attraction = await Attraction.findById(
        req.params.attractionId
      ).select("-note");

      const { start_time, duration, transport } = req.body;

      if (start_time) {
        if (!moment.unix(start_time).isValid()) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Start time is not valid" }] });
        }
        attraction.start_time = moment.unix(start_time);
      }

      if (duration) {
        if (isNaN(Number(duration))) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Duration is not valid" }] });
        }
        attraction.duration = duration;
      }

      if (transport) {
        const { mode, time } = transport;

        if (!mode || !time) {
          return res.status(400).json({
            errors: [
              { msg: "Transportation should contain both mode and time" },
            ],
          });
        }

        if (isNaN(Number(time))) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Transporation time is not valid" }] });
        }
        attraction.transport = transport;
      }

      await attraction.save();

      return res.status(200).json(attraction);
    } catch (err) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Attraction could not be updated" }] });
    }
  }
);

// @route    POST /v1/trip/:tripId/attraction/:attractionId
// @desc     Delete Attraction
// @access   Private
router.delete(
  "/v1/trip/:tripId/attraction/:attractionId",
  auth,
  async (req, res) => {
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
