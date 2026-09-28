const router = require("express").Router();

const { protect, authorize } = require("../middleware/auth");
const controller = require("../controllers/aiController");

router.post(
  "/ideas",
  protect,
  authorize("admin", "editor", "author"),
  controller.ideas
);

router.post(
  "/improve",
  protect,
  authorize("admin", "editor", "author"),
  controller.improve
);

router.post(
  "/summarize",
  protect,
  authorize("admin", "editor", "author"),
  controller.summarize
);

router.post(
  "/chat",
  protect,
  controller.chat
);

module.exports = router;