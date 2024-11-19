const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const app = express();
app.use(express.static("public"));
app.use("/images", express.static("public/images"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// FAQ Data
let faqData = [
  {
    "_id": 1,
    "question": "How can I prepare my lawn for the fall season?",
    "answer": "Preparing your lawn for fall includes aerating the soil...",
    "img_name": "images/fall_lawn_care.jpg",
    "related_services": ["Lawn Aeration", "Overseeding", "Seasonal Fertilization"],
    "category": "Lawn Care Tips",
    "updated_date": "2024-10-10"
  },
  {
    "_id": 2,
    "question": "What are the best practices for watering my lawn during a heatwave?",
    "answer": "During a heatwave, water your lawn deeply and less frequently—about twice a week—to encourage deep root growth. Watering early in the morning helps reduce evaporation and ensures the grass can absorb moisture efficiently. An irrigation system can be an effective way to automate this process and prevent under or over-watering.",
    "img_name": "images/heatwave_lawn_care.jpg",
    "related_services": [
      "Irrigation System Installation",
      "Lawn Maintenance",
      "Drought-Resistant Landscaping"
    ],
    "category": "Lawn Maintenance",
    "updated_date": "2024-09-15"
  },
  {
    "_id": 3,
    "question": "How can I prevent weeds from taking over my lawn?",
    "answer": "Weeds can be a persistent problem, but maintaining a healthy, thick lawn is the best defense. Mow your lawn regularly, apply a pre-emergent herbicide in the spring, and consider mulching garden beds to suppress weed growth. Our weed control services can help eliminate existing weeds and prevent future growth.",
    "img_name": "images/weed_control.jpg",
    "related_services": [
      "Weed Control",
      "Lawn Mowing",
      "Mulching Services"
    ],
    "category": "Lawn Health",
    "updated_date": "2024-09-01"
  },
  {
    "_id": 4,
    "question": "Why is mulching important for my garden and lawn?",
    "answer": "Mulching helps retain soil moisture, suppresses weeds, and regulates soil temperature. Organic mulch breaks down over time, adding essential nutrients back into the soil. Consider our mulching service to protect your plants and keep your garden beds looking neat year-round.",
    "img_name": "images/mulching_benefits.jpg",
    "related_services": [
      "Mulching Services",
      "Garden Maintenance",
      "Soil Amendment"
    ],
    "category": "Garden Care",
    "updated_date": "2024-08-20"
  },
  {
    "_id": 5,
    "question": "How can I keep my lawn green and healthy throughout the summer?",
    "answer": "To keep your lawn green and healthy, mow at a higher height to reduce stress on the grass, water deeply in the early morning, and apply a slow-release fertilizer. Regular maintenance, such as lawn aeration and pest control, will help prevent common summer issues like drought stress and insect damage.",
    "img_name": "images/summer_lawn_care.jpg",
    "related_services": [
      "Lawn Mowing",
      "Lawn Aeration",
      "Pest Control"
    ],
    "category": "Lawn Maintenance",
    "updated_date": "2024-08-05"
  },
  {
    "_id": 6,
    "question": "What are some landscaping tips to boost curb appeal?",
    "answer": "Simple improvements like adding flower beds, trimming shrubs, and installing a fresh layer of mulch can significantly enhance curb appeal. A well-designed landscape can also increase property value. Our landscape design team can help create a tailored plan to transform your yard.",
    "img_name": "images/curb_appeal.jpg",
    "related_services": [
      "Landscape Design",
      "Shrub Trimming",
      "Mulching Services"
    ],
    "category": "Landscape Design",
    "updated_date": "2024-07-30"
  },
  {
    "_id": 7,
    "question": "Why should I consider professional tree pruning?",
    "answer": "Tree pruning helps remove dead or diseased branches, improves the tree’s structure, and promotes healthy growth. Regular pruning also reduces the risk of falling branches during storms. Our tree care services ensure that your trees remain healthy and your property stays safe.",
    "img_name": "images/tree_pruning.jpg",
    "related_services": [
      "Tree Pruning",
      "Storm Damage Prevention",
      "Tree Removal"
    ],
    "category": "Tree Care",
    "updated_date": "2024-07-15"
  },
  {
    "_id": 8,
    "question": "How can I create a low-maintenance landscape?",
    "answer": "A low-maintenance landscape can be achieved by incorporating drought-tolerant plants, using mulch to reduce weeds, and installing an efficient irrigation system. Our landscape design service can help you create a beautiful and easy-to-care-for yard.",
    "img_name": "images/low_maintenance_landscape.jpg",
    "related_services": [
      "Drought-Resistant Landscaping",
      "Mulching Services",
      "Irrigation System Installation"
    ],
    "category": "Landscape Design",
    "updated_date": "2024-07-01"
  }
];

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/faqs", (req, res) => {
  res.send(faqData);
});

app.put("/api/faqs/:id", upload.single("img"), (req, res) => {
  const faq = faqData.find((f) => f._id === parseInt(req.params.id));
  if (!faq) {
    return res.status(404).send("FAQ with given ID not found.");
  }

  const result = validateFaq(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  faq.question = req.body.question;
  faq.answer = req.body.answer;
  faq.related_services = req.body.related_services ? req.body.related_services.split(",") : [];
  faq.category = req.body.category;
  faq.updated_date = new Date().toISOString().split("T")[0];

  if (req.file) {
    faq.img_name = "images/" + req.file.filename;
  }

  res.send(faq);
});

app.delete("/api/faqs/:id", (req, res) => {
  const faq = faqData.find((f) => f._id === parseInt(req.params.id));
  if (!faq) {
    return res.status(404).send("The FAQ with the given ID was not found.");
  }

  const index = faqData.indexOf(faq);
  faqData.splice(index, 1);
  res.send(faq);
});

app.post("/api/faqs", upload.single("img"), (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);
  const data = {
    question: req.body.question, 
    answer: req.body.answer, 
    related_services: req.body.related_services
    ? Array.isArray(req.body.related_services)
      ? req.body.related_services // Already an array
      : [req.body.related_services] // Convert single string to array
    : [], 
    category: req.body.category,
    updated_date: req.body.updated_date || new Date().toISOString().split("T")[0],
  };

  const result = validateFaq(data);

  if (result.error) {
    return res.status(400).send({ message: result.error.details[0].message });
  }

  const faq = {
    _id: faqData.length + 1,
    ...data,
  };

  if (req.file) {
    faq.img_name = "images/" + req.file.filename;
  } else {
    faq.img_name = null;
  }

  faqData.push(faq);
  res.status(200).send(faq);
});

const validateFaq = (faq) => {
  const schema = Joi.object({
    question: Joi.string().min(5).required(),
    answer: Joi.string().min(10).required(),
    related_services: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string()) // Accept array or single string
      .optional(),
    category: Joi.string().min(3).required(),
    updated_date: Joi.date().optional(),
  });

  return schema.validate(faq);
};


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
