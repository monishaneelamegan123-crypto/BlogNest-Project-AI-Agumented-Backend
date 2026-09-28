const User = require("../models/User");

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name role avatarUrl")
      .populate("following", "name role avatarUrl");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function followUser(req, res, next) {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = req.user.following.some(
      id => id.toString() === target._id.toString()
    );

    if (alreadyFollowing) {
      req.user.following.pull(target._id);
      target.followers.pull(req.user._id);
    } else {
      req.user.following.addToSet(target._id);
      target.followers.addToSet(req.user._id);
    }

    await Promise.all([req.user.save(), target.save()]);

    res.json({
      following: !alreadyFollowing,
      followers: target.followers.length
    });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

    await user.save();
    res.json({ message: "User updated", user });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUser, followUser, listUsers, updateUser };
