// src/config/initDb.ts
import { query } from "./db";
import fs from "fs";
import path from "path";

// Funkcja do inicjalizacji bazy danych
export const initializeDb = async () => {
  try {
    // Wczytaj skrypt SQL z pliku
    const sqlScriptPath = path.join(__dirname, "../../src/scripts/init.sql");
    const sqlScript = fs.readFileSync(sqlScriptPath, "utf-8");

    // Wykonaj skrypt SQL
    await query(sqlScript);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
