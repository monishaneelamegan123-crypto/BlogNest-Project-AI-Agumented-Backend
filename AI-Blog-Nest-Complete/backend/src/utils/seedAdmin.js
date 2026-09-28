require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@aiblognest.local" });

  if (existing) {
    console.log("Admin already exists");
  } else {
    await User.create({
      name: "AI Blog Nest Admin",
      email: "admin@aiblognest.local",
      password: "Admin@12345",
      role: "admin",
      bio: "Platform administrator"
    });
    console.log("Admin created");
  }

  await mongoose.disconnect();
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
