const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  // Validate request
  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    // Store into Database
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();

    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });

    //http://localhost:3000/files/2556afafsevrf-2355afasdfe
    //local host + files + uuid
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailForm } = req.body;
  //validate request
  if (!uuid || !emailForm || !emailTo) {
    return res.status(422).send({ error: "All fields are requires" });
  }

  const file = await File.findOne({ uuid: uuid });
  if (file.sender) {
    return res.status(422).send({ error: "Email already sent" });
  }

  file.sender = emailForm;
  file.receiver = emailTo;
  const response = await file.save();

  // Send email
  const sendMail = require("../services/emailService");
  sendMail({
    from: emailForm,
    to: emailTo,
    subject: "Filesharing app",
    text: `${emailForm} shared a this file.`,
    html: require("../services/emailTemplate")({
      emailFrom: emailForm,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });
  return res.send({ success: true });
});

module.exports = router;
