/**
 * Routes file, uses express validator to validate the server side
 * Yoel Abecassis
 */

const express = require("express"),
  userRoutes = require("./media"),
  { body } = require("express-validator");

let router = express.Router();

router.get("/media", userRoutes.read_media);
router.get("/media/:id", userRoutes.read_media_id);
router.post(
  "/media",
  body("id").notEmpty().isAlphanumeric(),
  body("name").notEmpty().isAlphanumeric("en-US", { ignore: " " }),
  body("picture").notEmpty().isURL(),
  body("director").notEmpty().isAlpha("en-US", { ignore: " " }),
  body("date").notEmpty(),
  body("rating").notEmpty().isInt({ min: 1, max: 5 }),
  body("isSeries").notEmpty().isBoolean(),
  body("series_details")
    .if(({ req }) => {
      return req.body.isSeries;
    })
    .notEmpty(),
  userRoutes.create_media
);
router.put("/media/:id", userRoutes.update_media);
router.delete("/media/:id", userRoutes.delete_media);
router.put(
  "/media/:id/actors",
  body("name").notEmpty().isAlpha("en-US", { ignore: " " }),
  body("picture").notEmpty().isURL(),
  body("site").notEmpty().isURL(),
  userRoutes.update_actors
);
router.delete("/media/:id/actors/:name", userRoutes.delete_actor);

module.exports = router;
