"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomName = function () {
    return `${String(Math.round(Math.random() * 1e6))}-${Date.now()}`;
};
