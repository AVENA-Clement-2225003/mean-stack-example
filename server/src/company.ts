import * as mongodb from "mongodb";

export interface Company {
    name: string;
    industry: string;
    _id?: mongodb.ObjectId;
}