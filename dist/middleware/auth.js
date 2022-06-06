"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthSessionFromRequest = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const database_1 = require("../database");
const getAuthSessionFromRequest = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie)
        return null;
    const session = yield database_1.SessionRepo.findOne({
        where: { id: Number(sessionCookie) },
        relations: ["user"]
    });
    if (!session)
        return null;
    return session;
});
exports.getAuthSessionFromRequest = getAuthSessionFromRequest;
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authSession = yield (0, exports.getAuthSessionFromRequest)(req);
    if (!authSession)
        return next((0, http_errors_1.default)(401, 'Please login to view this page.'));
    req.user = authSession.user;
    return next();
});
exports.default = auth;
