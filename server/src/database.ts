import * as mongodb from "mongodb";
import { Employee } from "./employee";
import { Company } from "./company";

export const collections: {
    employees?: mongodb.Collection<Employee>;
    companies?: mongodb.Collection<Company>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("meanStackExample");
    await applySchemaValidation(db);

    const employeesCollection = db.collection<Employee>("employees");
    const companiesCollection = db.collection<Company>("companies");
    collections.employees = employeesCollection;
    collections.companies = companiesCollection;
}

async function applySchemaValidation(db: mongodb.Db) {
    const employeeJsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "position", "level"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                position: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                },
                level: {
                    bsonType: "string",
                    description: "'level' is required and is one of 'junior', 'mid', or 'senior'",
                    enum: ["junior", "mid", "senior"],
                },
            },
        },
    };

    const companyJsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "industry"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                industry: {
                    bsonType: "string",
                    description: "'industry' is required and is a string",
                },
            },
        },
    };

    // Apply schema validation to the employees collection
    await db.command({
        collMod: "employees",
        validator: employeeJsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("employees", { validator: employeeJsonSchema });
        }
    });

    // Apply schema validation to the companies collection
    await db.command({
        collMod: "companies",
        validator: companyJsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("companies", { validator: companyJsonSchema });
        }
    });
}