const {
  generateBlogIdeas,
  improveContent,
  summarizeContent,
  chatbot
} = require("../services/gemini");

async function ideas(req, res, next) {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const result = await generateBlogIdeas(req.body.topic);

    res.json({ result });
  } catch (error) {
    next(error);
  }
}

async function improve(req, res, next) {
  try {
    if (!req.body.content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const result = await improveContent(req.body.content);

    res.json({ result });
  } catch (error) {
    next(error);
  }
}

async function summarize(req, res, next) {
  try {
    if (!req.body.content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const result = await summarizeContent(req.body.content);

    res.json({ result });
  } catch (error) {
    next(error);
  }
}

async function chat(req, res, next) {
  try {
    if (!req.body.message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const result = await chatbot(req.body.message);

    res.json({ result });
  } catch (error) {
    next(error);
  }
}

module.exports = { ideas, improve, summarize, chat };