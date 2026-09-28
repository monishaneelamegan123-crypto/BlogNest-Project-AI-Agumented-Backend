const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const controller = require("../controllers/userController");

router.get("/:id", controller.getUser);
router.post("/:id/follow", protect, controller.followUser);
router.get("/", protect, authorize("admin"), controller.listUsers);
router.patch("/:id", protect, authorize("admin"), controller.updateUser);

module.exports = router;
