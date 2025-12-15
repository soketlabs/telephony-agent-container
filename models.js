// const { json } = require("express");

// class RequestModel {
//     constructor(method, url, headers = {}, body = null, timeout = 30000) {
//         this.method = method;
//         this.url = url;
//         this.headers = headers;
//         this.body = body;
//         this.timeout = timeout;
//     }
// }

// class ResponseModel {
//     constructor(statusCode, headers = {}, body = null, error = null) {
//         this.statusCode = statusCode;
//         this.headers = headers;
//         this.body = body;
//         this.error = error;
//         this.timestamp = new Date();
//     }

//     isSuccess() {
//         return this.statusCode >= 200 && this.statusCode < 300;
//     }

//     isError() {
//         return !this.isSuccess();
//     }
// }

// module.exports = { RequestModel, ResponseModel };

import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },

    name: String,
    phone: String,
    workflow: String,
    language: String,

    containerId: String,
    containerName: String,

    userId: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String 
});

export const Agent = mongoose.model("Agent", AgentSchema);
export const User = mongoose.model("User", UserSchema);
