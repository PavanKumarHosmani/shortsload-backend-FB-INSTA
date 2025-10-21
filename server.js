import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// ✅ Health Check
app.get("/", (req, res) =>
  res.send("✅ Facebook + Instagram Downloader Backend Running")
);

// 🌐 Resolve fb.watch redirect
async function resolveFacebookUrl(url) {
  try {
    if (url.includes("fb.watch")) {
      const response = await fetch(url, { redirect: "follow" });
      return response.url;
    }
    return url;
  } catch {
    return url;
  }
}

// 🎯 Detect platform type
function detectPlatform(url) {
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  if (url.includes("instagram.com")) return "instagram";
  return "unknown";
}

// 🎬 Common download handler
function runYtDlp(url, res) {
  const proc = spawn("yt-dlp", [
    "--dump-single-json",
    "--no-warnings",
    "--geo-bypass",
    "--no-check-certificate",
    url,
  ]);

  let output = "", errorLog = "";
  proc.stdout.on("data", (d) => (output += d.toString()));
  proc.stderr.on("data", (d) => (errorLog += d.toString()));

  proc.on("close", (code) => {
    if (code !== 0 || !output.trim()) {
      console.error("yt-dlp error:", errorLog);
      return res.status(500).json({ error: "Failed to fetch formats" });
    }

    try {
      const info = JSON.parse(output);
      const formats = (info.formats || [])
        .filter((f) => f.url && f.ext === "mp4")
        .map((f) => ({
          quality: f.height ? `${f.height}p` : "unknown",
          url: f.url,
        }));

      res.json({
        title: info.title || "Unknown Title",
        uploader: info.uploader || "Unknown",
        thumbnail: info.thumbnail || null,
        formats,
        availableFormats: formats.length,
      });
    } catch (err) {
      console.error("Parse error:", err);
      res.status(500).json({ error: "Failed to parse video info" });
    }
  });
}

// 📥 Unified API endpoint
app.get("/api/getinfo", async (req, res) => {
  const inputUrl = req.query.url;
  if (!inputUrl) return res.status(400).json({ error: "Missing URL" });

  const platform = detectPlatform(inputUrl);

  if (platform === "facebook") {
    const resolvedUrl = await resolveFacebookUrl(inputUrl);
    return runYtDlp(resolvedUrl, res);
  }

  if (platform === "instagram") {
    return runYtDlp(inputUrl, res);
  }

  return res.status(400).json({ error: "Unsupported URL. Use Facebook or Instagram links only." });
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Unified Downloader running on port ${PORT}`)
);


