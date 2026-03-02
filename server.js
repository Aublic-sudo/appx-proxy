import express from "express";
import fetch from "node-fetch";

const app = express();

/* 🔐 Allowed Domains */
const ALLOWED_HOSTS = [
  "akamai.net.in",
  "classx.co.in",
  "cloud-front.in",
  "liveclasses.cloud-front.in"
];

/* 🔥 PROXY ROUTE */
app.get("/proxy", async (req, res) => {

  const target = req.query.url;
  if (!target) return res.status(400).send("Missing URL");

  try {

    const urlObj = new URL(target);

    /* 🔐 Security: Allow only specific domains */
    const allowed = ALLOWED_HOSTS.some(domain =>
      urlObj.hostname.endsWith(domain)
    );

    if (!allowed) {
      return res.status(403).send("Domain not allowed");
    }

    /* 🔥 Fetch from target with custom headers */
    const response = await fetch(target, {
      headers: {
        Referer: "https://test.akamai.net.in/",
        Origin: "https://test.akamai.net.in",
        "User-Agent": "Mozilla/5.0"
      }
    });

    /* 🔥 Copy important headers */
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    /* 🔥 Stream directly */
    response.body.pipe(res);

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy Error");
  }
});

/* 🔥 Root check */
app.get("/", (req, res) => {
  res.send("Proxy running 🚀");
});

/* 🔥 Dynamic Port (Render compatible) */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
