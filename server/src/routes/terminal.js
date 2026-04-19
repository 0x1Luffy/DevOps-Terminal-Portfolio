const express = require("express");
const path = require("path");
const router = express.Router();

// Serve resume PDF download
router.get("/resume", (req, res) => {
  const resumePath = path.join(__dirname, "../../public/resume.pdf");
  res.download(resumePath, "Chetan_DevOps_Resume.pdf", (err) => {
    if (err) {
      res.status(404).json({
        error: "Resume not found. Please add your resume.pdf to server/public/",
      });
    }
  });
});

// Return profile metadata (for SEO / OpenGraph)
router.get("/profile", (req, res) => {
  const { profile } = require("../data/profile");
  res.json({ ...profile });
});

module.exports = router;
