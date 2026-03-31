const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const { parseResumeText } = require("./resumeParser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  console.log("Request received at /api/upload-resume");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("Uploaded file:", req.file.originalname);

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    const rawText = pdfData.text || "";

    const parsedResume = parseResumeText(rawText);

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      rawText,
      parsedResume,
    });
  } catch (error) {
    console.error("Upload/parsing error:", error);
    return res.status(500).json({ error: "Failed to parse resume." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});