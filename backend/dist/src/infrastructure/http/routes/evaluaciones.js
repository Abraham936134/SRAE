"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evaluacionesController_1 = require("../controllers/evaluacionesController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const controller = new evaluacionesController_1.EvaluacionesController();
// Authentication required to apply evaluations
router.use(auth_1.authMiddleware);
router.post('/', (0, validate_1.validateBody)(evaluacionesController_1.aplicarEvaluacionSchema), (req, res) => controller.apply(req, res));
exports.default = router;
