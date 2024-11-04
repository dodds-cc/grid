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
const react_1 = __importStar(require("react"));
const helpers_1 = require("../helpers");
const DefaultTooltipComponent = ({ x = 0, y = 0, scrollLeft = 0, scrollTop = 0, width = 0, height = 0, }) => {
    const posX = x + width - scrollLeft;
    const posY = y - scrollTop;
    return (react_1.default.createElement("div", { style: {
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${posX}px, ${posY}px)`,
            maxWidth: 200,
            minWidth: 160,
            background: "white",
            boxShadow: "0 4px 8px 3px rgba(60,64,67,.15)",
            padding: 12,
            borderRadius: 4,
            fontSize: 13,
        } }, x));
};
const getDefaultTooltip = () => DefaultTooltipComponent;
const useTooltip = ({ gridRef, getTooltip = getDefaultTooltip, }) => {
    const [activeCell, setActiveCell] = (0, react_1.useState)(null);
    const isTooltipActive = (0, react_1.useRef)(false);
    const activeCellRef = (0, react_1.useRef)(activeCell);
    const [tooltipPosition, setTooltipPosition] = (0, react_1.useState)({});
    const showTooltip = !!activeCell;
    const TooltipComponent = (0, react_1.useMemo)(() => {
        return getTooltip(activeCell);
    }, [activeCell, getTooltip]);
    const handleTooltipMouseEnter = (0, react_1.useCallback)(() => {
        isTooltipActive.current = true;
    }, []);
    const handleTooltipMouseLeave = (0, react_1.useCallback)(() => {
        isTooltipActive.current = false;
        setActiveCell(null);
    }, []);
    const tooltipComponent = showTooltip && TooltipComponent ? (react_1.default.createElement(TooltipComponent, { ...tooltipPosition, onMouseEnter: handleTooltipMouseEnter, onMouseLeave: handleTooltipMouseLeave })) : null;
    const handleMouseMove = (0, react_1.useCallback)((e) => {
        if (!gridRef.current)
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.clientX, e.clientY);
        if (!coords)
            return;
        const { rowIndex, columnIndex } = coords;
        /* Exit if its the same cell */
        if (activeCellRef.current &&
            activeCellRef.current.rowIndex === rowIndex &&
            activeCellRef.current.columnIndex === columnIndex)
            return;
        const pos = gridRef.current.getCellOffsetFromCoords(coords);
        const scrollPosition = gridRef.current.getScrollPosition();
        setTooltipPosition({
            ...pos,
            ...scrollPosition,
        });
        setActiveCell({ rowIndex, columnIndex });
    }, []);
    const handleMouseLeave = (0, react_1.useCallback)(() => {
        if (isTooltipActive.current)
            return;
        setActiveCell(null);
    }, []);
    /* Raf throttler */
    const mouseMoveThrottler = (0, react_1.useRef)();
    const mouseLeaveThrottler = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        mouseMoveThrottler.current = (0, helpers_1.throttle)(handleMouseMove, 100);
        mouseLeaveThrottler.current = (0, helpers_1.debounce)(handleMouseLeave, 2000);
    }, []);
    /* Update activecell ref */
    (0, react_1.useEffect)(() => {
        activeCellRef.current = activeCell;
    }, [activeCell]);
    return {
        tooltipComponent,
        onMouseMove: mouseMoveThrottler.current,
        onMouseLeave: mouseLeaveThrottler.current,
    };
};
exports.default = useTooltip;
//# sourceMappingURL=useTooltip.js.map