"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_konva_1 = require("react-konva");
const GridLine = (props) => {
    const { points, stroke, strokeWidth, offsetY, offsetX } = props;
    return (react_1.default.createElement(react_konva_1.Line, { points: points, stroke: stroke, strokeWidth: strokeWidth, offsetY: offsetY, offsetX: offsetX, shadowForStrokeEnabled: false, strokeScaleEnabled: false, hitStrokeWidth: 0, listening: false, perfectDrawEnabled: false }));
};
exports.default = GridLine;
//# sourceMappingURL=GridLine.js.map