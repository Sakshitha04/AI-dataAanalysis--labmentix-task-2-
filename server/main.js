require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Store uploaded CSV data in memory
let dataset = [];

// Check if API key exists
if (!process.env.OPENROUTER_API_KEY) {
  console.log("❌ Missing OPENROUTER_API_KEY in .env file");
}

// ── Upload Route ──────────────────────────────────────────────────────────────
app.post("/upload", (req, res) => {
  dataset = req.body.data;
  console.log("✅ Data received, rows:", dataset.length);
  res.json({ message: "Data received", rows: dataset.length });
});

// ── Ask AI Route ──────────────────────────────────────────────────────────────
app.post("/ask-ai", async (req, res) => {
  const { query, columns } = req.body;

  if (!query || !columns) {
    return res.status(400).json({ error: "Query and columns are required" });
  }

  const prompt = `You are a data analyst assistant.

Available columns: ${columns.join(", ")}

The user asked: "${query}"

Reply ONLY with a valid JSON object like this:
{
  "xKey": "column_name",
  "yKey": "column_name",
  "operation": "avg"
}

Rules:
- xKey must be one of the available columns
- yKey must be one of the available columns (pick a numeric one)
- operation must be one of: avg, sum, count
- Return ONLY the JSON. No explanation. No extra text.`;

  try {
    console.log("🤖 Calling OpenRouter AI...");

    const response = await axios({
      method: "post",
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        // Free model — no credits needed
        model:  "openrouter/free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      timeout: 30000,
    });

    // Get the AI response text
    const output = response.data?.choices?.[0]?.message?.content || "";
    console.log("🤖 Raw AI output:", output);

    if (!output) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    // Extract JSON from the AI response
    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}");

    // If no JSON found, return smart fallback
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.log("⚠️ No JSON in response, using fallback");
      return res.json({
        xKey: columns[0],
        yKey: columns[1] || columns[0],
        operation: "count",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(output.slice(jsonStart, jsonEnd + 1));
    } catch (e) {
      console.log("⚠️ Invalid JSON, using fallback");
      return res.json({
        xKey: columns[0],
        yKey: columns[1] || columns[0],
        operation: "count",
      });
    }

    // Fallback values if AI missed something
    if (!parsed.xKey) parsed.xKey = columns[0];
    if (!parsed.yKey) parsed.yKey = columns[1] || columns[0];
    if (!parsed.operation) parsed.operation = "count";

    console.log("✅ AI result:", parsed);
    res.json(parsed);

  } catch (err) {
    console.error("❌ AI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI request failed. Check your API key." });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
