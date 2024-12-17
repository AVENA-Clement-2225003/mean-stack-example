import * as express from "express";
import { collections } from "./database";

export const searchRouter = express.Router();
searchRouter.use(express.json());

searchRouter.get("/", async (req, res) => {
  try {
    const { keyword, type, mode } = req.query;

    if (!keyword || !type) {
      res.status(400).send("Missing keyword or type");
      return;
    }

    const searchRegex = new RegExp(keyword as string, "i"); // 'i' for case-insensitive

    let results;
    if (type === "company") {
      results = await collections?.companies?.find({ 
        $or: [
          { name: searchRegex }, 
          { industry: searchRegex }
        ] 
      }).sort({ name: mode === "asc" ? 1 : -1 }).toArray();
    } else if (type === "employee") {
      results = await collections?.employees?.find({ 
        $or: [
          { name: searchRegex }, 
          { position: searchRegex }, 
          { level: searchRegex }
        ] 
      }).sort({ name: mode === "asc" ? 1 : -1 }).toArray();
    } else {
      res.status(400).send("Invalid type");
      return;
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
});
