import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const companyRouter = express.Router();
companyRouter.use(express.json());

companyRouter.get("/", async (_req, res) => {
    try {
        const companies = await collections?.companies?.find({}).toArray();
        res.status(200).send(companies);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

companyRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const company = await collections?.companies?.findOne(query);

        if (company) {
            res.status(200).send(company);
        } else {
            res.status(404).send(`Failed to find an company: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Failed to find an company: ID ${req?.params?.id}`);
    }
});

companyRouter.post("/", async (req, res) => {
    try {
        const company = req.body;
        const result = await collections?.companies?.insertOne(company);

        if (result?.acknowledged) {
            res.status(201).send(`Created a new company: ID ${result.insertedId}.`);
        } else {
            res.status(500).send("Failed to create a new company.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

companyRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const company = req.body;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.companies?.updateOne(query, { $set: company });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated an company: ID ${id}.`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find an company: ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an company: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

companyRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.companies?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Removed an company: ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an company: ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an company: ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});