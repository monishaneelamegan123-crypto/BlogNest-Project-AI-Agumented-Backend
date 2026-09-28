const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const controller = require("../controllers/postController");

router.get("/", controller.listPosts);
router.get("/feed", protect, controller.feed);
router.get("/manage/all", protect, authorize("admin", "editor"), controller.adminList);
router.get("/:id", controller.getPost);

router.post(
  "/",
  protect,
  authorize("admin", "editor", "author"),
  [
    body("title").trim().isLength({ min: 3, max: 180 }),
    body("content").trim().isLength({ min: 10 })
  ],
  validate,
  controller.createPost
);

router.put("/:id", protect, authorize("admin", "editor", "author"), controller.updatePost);
router.delete("/:id", protect, authorize("admin", "editor", "author"), controller.deletePost);
router.post("/:id/like", protect, controller.likePost);
router.post("/:id/save", protect, controller.savePost);
router.post("/:id/comments", protect, body("text").trim().isLength({ min: 1, max: 1000 }), validate, controller.addComment);
router.patch("/:id/status", protect, authorize("admin", "editor"), controller.changeStatus);

module.exports = router;
