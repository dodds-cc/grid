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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = exports.CellRenderer = void 0;
const react_1 = __importStar(require("react"));
const react_konva_1 = require("react-konva");
const helpers_1 = require("./helpers");
/**
 * Default cell component
 * @param props
 */
const Cell = (0, react_1.memo)((props) => {
    const { x = 0, y = 0, width, height, value, fill = "white", strokeWidth = 1, stroke = "#d9d9d9", align = "left", verticalAlign = "middle", textColor = "#333", padding = 5, fontFamily = "Arial", fontSize = 12, children, wrap = "none", fontWeight = "normal", fontStyle = "normal", textDecoration, alpha = 1, strokeEnabled = true, globalCompositeOperation = "multiply", isOverlay, ...rest } = props;
    if (isOverlay)
        return null;
    const fillEnabled = !!fill;
    const textStyle = `${fontWeight} ${fontStyle}`;
    return (react_1.default.createElement(react_konva_1.Group, { ...rest },
        react_1.default.createElement(react_konva_1.Rect, { x: x + 0.5, y: y + 0.5, height: height, width: width, fill: fill, stroke: stroke, strokeWidth: strokeWidth, shadowForStrokeEnabled: false, strokeScaleEnabled: false, hitStrokeWidth: 0, alpha: alpha, fillEnabled: fillEnabled, strokeEnabled: strokeEnabled }),
        (0, helpers_1.isNull)(value) ? null : (react_1.default.createElement(react_konva_1.Text, { x: x, y: y, height: height, width: width, text: value, fill: textColor, verticalAlign: verticalAlign, align: align, fontFamily: fontFamily, fontStyle: textStyle, textDecoration: textDecoration, padding: padding, wrap: wrap, fontSize: fontSize, hitStrokeWidth: 0 })),
        children));
});
exports.Cell = Cell;
/**
 * Default CellRenderer
 * @param props
 */
const CellRenderer = (props) => {
    return react_1.default.createElement(Cell, { ...props });
};
exports.CellRenderer = CellRenderer;
exports.default = CellRenderer;
//# sourceMappingURL=Cell.js.map