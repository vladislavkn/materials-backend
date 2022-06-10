import crypto from "crypto";

const generateSalt = () => crypto.randomBytes(64).toString("hex");

export default generateSalt;