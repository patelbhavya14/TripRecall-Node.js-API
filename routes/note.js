const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const moment = require("moment");
const Trip = require("../models/Trip");
const Attraction = require("../models/Attraction");
const Note = require("../models/Note");

// @route    POST /v1/attraction/:id/note
// @desc     Add note
// @access   Private
router.post(
  "/v1/attraction/:id/note",
  auth,
  [check("detail", "Note detail is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let note = await Note.findOne({ attraction: req.params.id });

      if (note) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Note already exists" }] });
      }

      note = new Note({
        attraction: req.params.id,
        detail: req.body.detail,
      });

      await note.save();

      await Attraction.findByIdAndUpdate(
        req.params.id,
        { note: note },
        { new: true }
      );
      return res.status(201).json(note);
    } catch (err) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Note could not be added" }] });
    }
  }
);

module.exports = router;
