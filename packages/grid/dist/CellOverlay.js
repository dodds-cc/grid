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
exports.CellOverlay = exports.CellRenderer = exports.getOffsetFromWidth = void 0;
const react_1 = __importStar(require("react"));
const react_konva_1 = require("react-konva");
/* Array placeholder */
const EMPTY_ARRAY = [];
/**
 * Offset helps multiple borders to align properly
 * @param width
 */
const getOffsetFromWidth = (width) => {
    return width / 2 - 0.5;
};
exports.getOffsetFromWidth = getOffsetFromWidth;
/**
 * Only used for strokes
 */
const CellOverlay = (0, react_1.memo)(props => {
    const { x, y, width, height, strokeTopColor, strokeRightColor, strokeBottomColor, strokeLeftColor, strokeTopDash = EMPTY_ARRAY, strokeRightDash = EMPTY_ARRAY, strokeBottomDash = EMPTY_ARRAY, strokeLeftDash = EMPTY_ARRAY, strokeTopWidth, strokeRightWidth, strokeBottomWidth, strokeLeftWidth, lineCap } = props;
    const userStroke = strokeTopColor || strokeRightColor || strokeBottomColor || strokeLeftColor;
    if (!userStroke)
        return null;
    return (react_1.default.createElement(react_konva_1.Shape, { x: x, y: y, width: width, height: height, sceneFunc: (context, shape) => {
            /* Top border */
            if (strokeTopColor) {
                context.beginPath();
                context.moveTo(strokeLeftColor ? -(0, exports.getOffsetFromWidth)(strokeLeftWidth) : 0, 0.5);
                context.lineTo(shape.width() +
                    (strokeRightColor ? (0, exports.getOffsetFromWidth)(strokeRightWidth) + 1 : 1), 0.5);
                context.setAttr("strokeStyle", strokeTopColor);
                context.setAttr("lineWidth", strokeTopWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeTopDash);
                context.stroke();
            }
            /* Bottom border */
            if (strokeBottomColor) {
                context.beginPath();
                context.moveTo(strokeLeftColor ? -(0, exports.getOffsetFromWidth)(strokeLeftWidth) : 0, shape.height() + 0.5);
                context.lineTo(shape.width() +
                    (strokeRightColor ? (0, exports.getOffsetFromWidth)(strokeRightWidth) + 1 : 1), shape.height() + 0.5);
                context.setAttr("lineWidth", strokeBottomWidth);
                context.setAttr("strokeStyle", strokeBottomColor);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeBottomDash);
                context.stroke();
            }
            /* Left border */
            if (strokeLeftColor) {
                context.beginPath();
                context.moveTo(0.5, strokeTopColor ? -(0, exports.getOffsetFromWidth)(strokeTopWidth) : 0);
                context.lineTo(0.5, shape.height() +
                    (strokeBottomColor
                        ? (0, exports.getOffsetFromWidth)(strokeBottomWidth) + 1
                        : 1));
                context.setAttr("strokeStyle", strokeLeftColor);
                context.setAttr("lineWidth", strokeLeftWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeLeftDash);
                context.stroke();
            }
            /* Right border */
            if (strokeRightColor) {
                context.beginPath();
                context.moveTo(shape.width() + 0.5, strokeTopColor ? -(0, exports.getOffsetFromWidth)(strokeTopWidth) : 0);
                context.lineTo(shape.width() + 0.5, shape.height() +
                    (strokeBottomColor
                        ? (0, exports.getOffsetFromWidth)(strokeBottomWidth) + 1
                        : 1));
                context.setAttr("strokeStyle", strokeRightColor);
                context.setAttr("lineWidth", strokeRightWidth);
                context.setAttr("lineCap", lineCap);
                context.setLineDash(strokeRightDash);
                context.stroke();
            }
        } }));
});
exports.CellOverlay = CellOverlay;
/**
 * Default CellRenderer
 * @param props
 */
const CellRenderer = (props) => {
    const { x, y, width, height, stroke, strokeTopColor = stroke, strokeRightColor = stroke, strokeBottomColor = stroke, strokeLeftColor = stroke, strokeDash = EMPTY_ARRAY, strokeTopDash = EMPTY_ARRAY, strokeRightDash = EMPTY_ARRAY, strokeBottomDash = EMPTY_ARRAY, strokeLeftDash = EMPTY_ARRAY, strokeWidth = 1, strokeTopWidth = strokeWidth, strokeRightWidth = strokeWidth, strokeBottomWidth = strokeWidth, strokeLeftWidth = strokeWidth, lineCap = "butt", key } = props;
    const userStroke = strokeTopColor || strokeRightColor || strokeBottomColor || strokeLeftColor;
    if (!userStroke)
        return null;
    return (react_1.default.createElement(CellOverlay, { key: key, x: x, y: y, width: width, height: height, strokeTopColor: strokeTopColor, strokeRightColor: strokeRightColor, strokeBottomColor: strokeBottomColor, strokeLeftColor: strokeLeftColor, strokeDash: strokeDash, strokeTopDash: strokeTopDash, strokeRightDash: strokeRightDash, strokeBottomDash: strokeBottomDash, strokeLeftDash: strokeLeftDash, strokeTopWidth: strokeTopWidth, strokeRightWidth: strokeRightWidth, strokeBottomWidth: strokeBottomWidth, strokeLeftWidth: strokeLeftWidth, lineCap: lineCap }));
};
exports.CellRenderer = CellRenderer;
exports.default = CellRenderer;
//# sourceMappingURL=CellOverlay.js.map