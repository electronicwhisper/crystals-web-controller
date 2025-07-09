const axios = require("axios");
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

async function updatePreset(effect_id, preset_id) {
  const apiUrl = "http://crystalspc.local:8888/api/virtuals/both/presets";
  const payload = {
    category: "user_presets",
    effect_id,
    preset_id,
  };

  try {
    const response = await axios.put(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("PUT request successful!");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error making PUT request:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      return {
        success: false,
        error: error.response.data,
        status: error.response.status,
      };
    } else if (error.request) {
      console.error("No response received:", error.request);
      return { success: false, error: "No response received" };
    } else {
      console.error("Error:", error.message);
      return { success: false, error: error.message };
    }
  }
}

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API route for preset updates
  if (pathname === "/api/preset" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { effect_id, preset_id } = JSON.parse(body);

        if (!effect_id || !preset_id) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "effect_id and preset_id are required" })
          );
          return;
        }

        const result = await updatePreset(effect_id, preset_id);

        res.writeHead(result.success ? 200 : 500, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Serve static files
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(__dirname, "static", filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, "static"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
      return;
    }

    // Set appropriate content type
    const ext = path.extname(filePath);
    const contentTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    res.setHeader("Content-Type", contentTypes[ext] || "text/plain");
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Local access: http://localhost:${PORT}/`);
  console.log(`Network access: http://toby.local:${PORT}/`);
  console.log(`API endpoint: http://${HOST}:${PORT}/api/preset`);
});
