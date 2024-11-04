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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_konva_1 = require("react-konva");
const useImage_1 = __importDefault(require("./hooks/useImage"));
const ImageComponent = (0, react_1.memo)((props) => {
    let { url, width = 0, height = 0, x = 0, y = 0, spacing = 1, ...rest } = props;
    const { image, width: imageWidth, height: imageHeight, status } = (0, useImage_1.default)({
        url,
    });
    const aspectRatio = (0, react_1.useMemo)(() => {
        return Math.min((width - spacing) / imageWidth, (height - spacing) / imageHeight);
    }, [imageWidth, imageHeight, width, height, spacing]);
    x = x + spacing;
    y = y + spacing;
    width = Math.min(imageWidth, aspectRatio * imageWidth);
    height = Math.min(imageHeight, aspectRatio * imageHeight);
    if (status !== "loaded") {
        return null;
    }
    return (react_1.default.createElement(react_konva_1.Image, { ...rest, x: x, y: y, height: height, width: width, image: image }));
});
exports.default = ImageComponent;
//# sourceMappingURL=Image.js.map