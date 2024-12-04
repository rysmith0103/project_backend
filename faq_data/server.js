const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://rysmith0103:RyanSmith@data.7wvpb.mongodb.net/?retryWrites=true&w=majority&appName=Data")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Couldn't connect to MongoDB:", error));

// Define FAQ schema and model
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  img_name: { type: String, required: false },
  related_services: [{ type: String }],
  category: { type: String, required: true },
  updated_date: { type: Date, default: Date.now },
});

const FAQ = mongoose.model("FAQ", faqSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Get all FAQs
app.get("/api/faqs", async (req, res) => {
  const faqs = await FAQ.find();
  res.send(faqs);
});

// Get a specific FAQ by ID
app.get("/api/faqs/:id", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).send("FAQ not found");
    res.send(faq);
  } catch (error) {
    res.status(500).send("Error fetching FAQ");
  }
});

// Add a new FAQ
app.post("/api/faqs", upload.single("img"), async (req, res) => {
  const result = validateFaq(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const faq = new FAQ({
    question: req.body.question,
    answer: req.body.answer,
    related_services: req.body.related_services
      ? req.body.related_services.split(",")
      : [],
    category: req.body.category,
  });

  if (req.file) {
    faq.img_name = "images/" + req.file.filename;
  }

  const newFaq = await faq.save();
  res.send(newFaq);
});

// Update an FAQ
app.put("/api/faqs/:id", upload.single("img"), async (req, res) => {
  const result = validateFaq(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const fieldsToUpdate = {
    question: req.body.question,
    answer: req.body.answer,
    related_services: req.body.related_services
      ? req.body.related_services.split(",")
      : [],
    category: req.body.category,
    updated_date: Date.now(),
  };

  if (req.file) {
    fieldsToUpdate.img_name = "images/" + req.file.filename;
  }

  const updatedFaq = await FAQ.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
  });

  if (!updatedFaq) {
    return res.status(404).send("FAQ not found");
  }

  res.send(updatedFaq);
});

// Delete an FAQ
app.delete("/api/faqs/:id", async (req, res) => {
  const deletedFaq = await FAQ.findByIdAndDelete(req.params.id);
  if (!deletedFaq) {
    return res.status(404).send("FAQ not found");
  }
  res.send(deletedFaq);
});

// Validate FAQ function using Joi
const validateFaq = (faq) => {
  const schema = Joi.object({
    question: Joi.string().min(5).required(),
    answer: Joi.string().min(10).required(),
    related_services: Joi.string().allow(""),
    category: Joi.string().min(3).required(),
    img_name: Joi.string().allow(""),
    updated_date: Joi.date().optional(),
  });

  return schema.validate(faq);
};

// Start the server
app.listen(3002, () => {
  console.log("Server is listening on port 3002");
});
