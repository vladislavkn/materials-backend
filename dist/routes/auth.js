"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importStar(require("../middleware/auth"));
const database_1 = require("../database");
const http_errors_1 = __importDefault(require("http-errors"));
const user_1 = __importDefault(require("../entities/user"));
const config_1 = __importDefault(require("../config"));
const crypto_1 = __importDefault(require("crypto"));
const session_1 = __importDefault(require("../entities/session"));
const router = (0, express_1.Router)();
router.post('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const userCandidate = yield database_1.UserRepo.findOneBy({ name });
    if (userCandidate)
        return next((0, http_errors_1.default)(400, "User with the same email already exists."));
    const user = new user_1.default();
    user.name = name;
    user.email = email;
    try {
        user.passwordHash =
            crypto_1.default.pbkdf2Sync(password, config_1.default.PASSWORD_SALT, 1000, 64, `sha512`)
                .toString(`hex`);
    }
    catch (e) {
        return next((0, http_errors_1.default)(500, "Error in password hashing."));
    }
    yield database_1.UserRepo.save(user).catch((e) => next((0, http_errors_1.default)(500, e.message)));
    return res.status(200).send({
        message: "User has been registered"
    });
}));
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let authSession = yield (0, auth_1.getAuthSessionFromRequest)(req);
    if (authSession)
        return next((0, http_errors_1.default)(400, "User is already logged in."));
    const { email, password } = req.body;
    const user = yield database_1.UserRepo.findOneBy({ email });
    if (!user)
        return next((0, http_errors_1.default)(400, "Email or password is incorrect."));
    const unCheckedPasswordHash = crypto_1.default.pbkdf2Sync(password, config_1.default.PASSWORD_SALT, 1000, 64, `sha512`)
        .toString(`hex`);
    if (unCheckedPasswordHash != user.passwordHash)
        return next((0, http_errors_1.default)(400, "Email or password is incorrect."));
    const session = new session_1.default();
    session.user = user;
    yield database_1.SessionRepo.save(session).catch((e) => next((0, http_errors_1.default)(500, e.message)));
    res.cookie("session", session.id, {
        httpOnly: true
    });
    const { passwordHash, createdAt } = user, userData = __rest(user, ["passwordHash", "createdAt"]);
    return res.status(200).json({ user: userData });
}));
router.post('/logout', auth_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("session");
    const authSession = yield (0, auth_1.getAuthSessionFromRequest)(req);
    yield database_1.SessionRepo.delete(authSession).catch((e) => next((0, http_errors_1.default)(500, e.message)));
    ;
    return res.status(200).send();
}));
router.get('/me', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.user, { passwordHash, createdAt } = _a, userDate = __rest(_a, ["passwordHash", "createdAt"]);
    return res.status(200).json({ user: userDate });
}));
exports.default = router;
