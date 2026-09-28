const Post = require("../models/Post");
const Comment = require("../models/Comment");
const slugify = require("slugify");

function canEdit(user, post) {
  return ["admin", "editor"].includes(user.role) ||
    (user.role === "author" && post.author._id.toString() === user._id.toString());
}

async function listPosts(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "9"), 1), 50);
    const search = (req.query.search || "").trim();

    const filter = { status: "published" };
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { excerpt: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name role avatarUrl bio")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter)
    ]);

    res.json({ posts, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name role avatarUrl bio");

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status === "published") {
      post.views += 1;
      await post.save();
    }

    const comments = await Comment.find({ post: post._id })
      .populate("user", "name avatarUrl role")
      .sort({ createdAt: -1 });

    res.json({ post, comments });
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, excerpt, content, coverImage, tags, status } = req.body;

    const allowedStatuses = ["draft", "pending"];
    let finalStatus = allowedStatuses.includes(status) ? status : "draft";

    if (["admin", "editor"].includes(req.user.role) && status === "published") {
      finalStatus = "published";
    }

    const post = await Post.create({
      title,
      slug: `${slugify(title, { lower: true, strict: true })}-${Date.now()}`,
      excerpt,
      content,
      coverImage,
      tags: Array.isArray(tags) ? tags : [],
      author: req.user._id,
      status: finalStatus,
      publishedAt: finalStatus === "published" ? new Date() : undefined
    });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!canEdit(req.user, post)) return res.status(403).json({ message: "Not allowed" });

    const { title, excerpt, content, coverImage, tags, status } = req.body;

    if (title) post.title = title;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (content) post.content = content;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (Array.isArray(tags)) post.tags = tags;

    if (status) {
      if (["admin", "editor"].includes(req.user.role)) {
        post.status = status;
      } else if (req.user.role === "author" && ["draft", "pending"].includes(status)) {
        post.status = status;
      }
    }

    if (post.status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();
    res.json({ message: "Post updated", post });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const owner = post.author.toString() === req.user._id.toString();
    if (!["admin", "editor"].includes(req.user.role) && !owner) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
}

async function likePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.findIndex(id => id.toString() === req.user._id.toString());

    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      liked: index < 0,
      likes: post.likes.length
    });
  } catch (error) {
    next(error);
  }
}

async function savePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.savedBy.findIndex(id => id.toString() === req.user._id.toString());

    if (index >= 0) post.savedBy.splice(index, 1);
    else post.savedBy.push(req.user._id);

    await post.save();

    res.json({
      saved: index < 0,
      savedCount: post.savedBy.length
    });
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text
    });

    await comment.populate("user", "name avatarUrl role");
    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

async function feed(req, res, next) {
  try {
    const user = await req.user.populate("following", "_id");
    const ids = user.following.map(u => u._id);

    const posts = await Post.find({
      author: { $in: ids },
      status: "published"
    })
      .populate("author", "name role avatarUrl")
      .sort({ publishedAt: -1 })
      .limit(30);

    res.json({ posts });
  } catch (error) {
    next(error);
  }
}

async function adminList(req, res, next) {
  try {
    const posts = await Post.find()
      .populate("author", "name email role")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.status = req.body.status;
    if (post.status === "published") post.publishedAt = new Date();

    await post.save();
    res.json({ message: "Post status updated", post });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPosts, getPost, createPost, updatePost, deletePost,
  likePost, savePost, addComment, feed, adminList, changeStatus
};
