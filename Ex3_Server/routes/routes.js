/**
 * Routes file, uses express validator to validate the server side
 * Yoel Abecassis
 */

const express = require("express"),
  userRoutes = require("./media"),
  { body } = require("express-validator");

let router = express.Router();

router.get("/media", userRoutes.read_media);
router.get("/media/:id", userRoutes.get_media_by_id);
router.get("/actors", userRoutes.get_actors);
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
router.post("/actor", userRoutes.create_actor);
router.put("/media/:id", userRoutes.update_media);
router.put("/media/:mediaId/actors/:actorId", userRoutes.add_actor_to_media);
router.delete("/media/:id", userRoutes.delete_media);
router.put(
  "/media/:id/actors",
  body("name").notEmpty().isAlpha("en-US", { ignore: " " }),
  body("picture").notEmpty().isURL(),
  body("site").notEmpty().isURL(),
  userRoutes.update_actors
);
router.delete("/media/:mediaId/actors/:actorId", userRoutes.delete_actor);

module.exports = router;
