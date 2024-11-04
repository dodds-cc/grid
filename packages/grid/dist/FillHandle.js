"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
/**
 * Fill handle component
 */
const FillHandle = ({ x = 0, y = 0, stroke, strokeWidth = 1, size = 8, borderColor, ...props }) => {
    if (x === 0 || y === 0)
        return null;
    return (react_1.default.createElement("div", { style: {
            position: "absolute",
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            border: `${strokeWidth}px ${borderColor} solid`,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            background: stroke,
            cursor: "crosshair",
            pointerEvents: "all",
        }, ...props }));
};
exports.default = FillHandle;
//# sourceMappingURL=FillHandle.js.map