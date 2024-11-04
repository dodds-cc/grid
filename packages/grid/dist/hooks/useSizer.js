"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const helpers_1 = require("./../helpers");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const defaultGetText = (text) => text;
/**
 * Auto sizer hook
 * @param param
 *
 * TODO
 * Dynamically resize columns after user has scrolled down/view port changed ?
 */
const useAutoSizer = ({ gridRef, getValue, initialVisibleRows = 20, cellSpacing = 10, minColumnWidth = 60, timeout = 300, resizeStrategy = "lazy", rowCount, resizeOnScroll = true, fontFamily = "Arial", fontSize = 12, fontWeight = "", fontStyle = "", autoResize = true, columnSizes = {}, frozenRows = 0, scale = 1, isHiddenRow, isHiddenColumn, getText = defaultGetText, }) => {
    (0, tiny_invariant_1.default)(!(resizeStrategy === "full" && rowCount === void 0), "Row count should be specified if resize stragtegy is full");
    const autoSizer = (0, react_1.useRef)(helpers_1.autoSizerCanvas);
    const [viewport, setViewport] = (0, react_1.useState)({
        rowStartIndex: 0,
        rowStopIndex: 0,
        columnStartIndex: 0,
        columnStopIndex: 0,
        visibleRowStartIndex: 0,
        visibleRowStopIndex: 0,
        visibleColumnStartIndex: 0,
        visibleColumnStopIndex: 0,
    });
    const isMounted = (0, react_1.useRef)(false);
    const getValueRef = (0, react_1.useRef)();
    const viewPortRef = (0, react_1.useRef)();
    const hiddenRowRef = (0, react_1.useRef)(isHiddenRow);
    const handleResize = (0, react_1.useCallback)(({ rowIndex, columnIndex }) => {
        gridRef.current &&
            gridRef.current.resetAfterIndices({ rowIndex, columnIndex });
    }, []);
    const debounceResizer = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        getValueRef.current = getValue;
        viewPortRef.current = viewport;
        hiddenRowRef.current = isHiddenRow;
    });
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        debounceResizer.current = (0, helpers_1.debounce)(handleResize, timeout);
    }, []);
    /* Update any styles, fonts if necessary */
    (0, react_1.useEffect)(() => {
        autoSizer.current.setFont({ fontFamily, fontSize, fontWeight, fontStyle });
    }, [fontFamily, fontSize, fontWeight, fontStyle]);
    const getTextMetrics = (0, react_1.useCallback)((text) => {
        return autoSizer.current.measureText((0, helpers_1.castToString)(text));
    }, []);
    /**
     * Get width of a single cell
     */
    const getCellWidth = (0, react_1.useCallback)((rowIndex, columnIndex) => {
        var _a, _b, _c;
        const cellValue = (_b = (_a = getValueRef.current) === null || _a === void 0 ? void 0 : _a.call(getValueRef, {
            rowIndex,
            columnIndex,
        })) !== null && _b !== void 0 ? _b : null;
        let width = (_c = cellValue === null || cellValue === void 0 ? void 0 : cellValue.spacing) !== null && _c !== void 0 ? _c : 0;
        /* Check if its null */
        if (cellValue !== null) {
            const isCellConfig = typeof cellValue === "object";
            const text = getText(cellValue);
            if (helpers_1.cellIdentifier !== void 0 && !(0, helpers_1.isNull)(text) && text !== void 0) {
                /* Reset fonts */
                autoSizer.current.reset();
                if (isCellConfig) {
                    const isBold = cellValue.bold;
                    autoSizer.current.setFont({
                        fontWeight: isBold ? "bold" : "",
                        fontSize: (cellValue.fontSize || fontSize) * scale,
                        fontFamily: cellValue.fontFamily,
                        fontStyle: cellValue.italic ? "italic" : "",
                    });
                }
                const metrics = autoSizer.current.measureText(text);
                if (metrics) {
                    width += Math.ceil(metrics.width) + cellSpacing;
                }
            }
        }
        return width;
    }, [scale]);
    /**
     * Calculate column width
     */
    const getColumnWidth = (0, react_1.useCallback)((columnIndex) => {
        var _a, _b, _c;
        const { rowStartIndex = 0, rowStopIndex = 0 } = (_a = viewPortRef.current) !== null && _a !== void 0 ? _a : {};
        const visibleRows = resizeStrategy === "full"
            ? rowCount
            : rowStopIndex || initialVisibleRows;
        let start = resizeStrategy === "full" ? 0 : rowStartIndex;
        let maxWidth = minColumnWidth;
        /* Calculate for frozen rows */
        for (let i = 0; i < frozenRows; i++) {
            if ((_b = hiddenRowRef.current) === null || _b === void 0 ? void 0 : _b.call(hiddenRowRef, i)) {
                continue;
            }
            const width = getCellWidth(i, columnIndex);
            if (width > maxWidth)
                maxWidth = width;
        }
        /* Loop through all visible rows */
        while (start < visibleRows) {
            if ((_c = hiddenRowRef.current) === null || _c === void 0 ? void 0 : _c.call(hiddenRowRef, start)) {
                start++;
                continue;
            }
            const width = getCellWidth(start, columnIndex);
            if (width > maxWidth)
                maxWidth = width;
            start++;
        }
        return maxWidth / scale;
    }, [viewport, initialVisibleRows, frozenRows, scale]);
    const handleViewChange = (0, react_1.useCallback)((cells) => {
        /* Update viewport cells */
        setViewport(cells);
        /* Check if viewport has changed */
        if (resizeStrategy === "full" ||
            !resizeOnScroll ||
            (cells.rowStartIndex === viewport.rowStartIndex &&
                cells.columnStartIndex === viewport.columnStartIndex))
            return;
        if (gridRef.current) {
            /* During first mount, column width is calculated. Do not re-calculate */
            if (!isMounted.current)
                return;
            debounceResizer.current({
                rowIndex: cells.rowStartIndex,
                columnIndex: cells.columnStartIndex,
            });
        }
    }, [resizeOnScroll, viewport, resizeStrategy]);
    return {
        ...(autoResize ? { columnWidth: getColumnWidth } : undefined),
        getColumnWidth,
        // getRowHeight,
        onViewChange: handleViewChange,
        getTextMetrics,
    };
};
exports.default = useAutoSizer;
//# sourceMappingURL=useSizer.js.map