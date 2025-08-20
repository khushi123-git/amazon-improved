const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Supabase setup
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"; 
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// API route: Save query
app.post("/api/support", async (req, res) => {
  const { name, query } = req.body;
  if (!name || !query) {
    return res.status(400).json({ message: "Name and query required!" });
  }

  const { error } = await supabase
    .from("support_queries")
    .insert([{ name, query }]);

  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: `✅ Thanks ${name}, your query was saved!` });
});

app.listen(5000, () => {
  console.log("✅ App running at http://localhost:5000");
});
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  "https://purnzijebomdwovbfdfm.supabase.co",
  process.env.SUPABASE_KEY
);

app.post("/api/support", async (req, res) => {
  const { name, query } = req.body;
  const { error } = await supabase.from("support_queries").insert([{ name, query }]);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "✅ Query submitted!" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
