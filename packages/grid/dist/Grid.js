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
exports.RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL = void 0;
const react_1 = __importStar(require("react"));
const react_konva_1 = require("react-konva");
const helpers_1 = require("./helpers");
const Cell_1 = require("./Cell");
const CellOverlay_1 = require("./CellOverlay");
const Selection_1 = __importDefault(require("./Selection"));
const FillHandle_1 = __importDefault(require("./FillHandle"));
const GridLine_1 = __importDefault(require("./GridLine"));
const utils_1 = require("./utils");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const types_1 = require("./types");
const DEFAULT_ESTIMATED_ITEM_SIZE = 50;
const defaultShadowSettings = {
    strokeWidth: 1,
};
const defaultRowHeight = () => 20;
const defaultColumnWidth = () => 60;
const defaultSelectionRenderer = (props) => {
    return react_1.default.createElement(Selection_1.default, { ...props });
};
const defaultGridLineRenderer = (props) => {
    return react_1.default.createElement(GridLine_1.default, { ...props });
};
exports.RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL = 150;
/* Placeholder for empty array -> Prevents re-render */
const EMPTY_ARRAY = [];
/**
 * Grid component using React Konva
 * @param props
 *
 * TODO: Fix bug with snapping, since onWheel is a global handler, rowCount, columnCount becomes state
 */
const Grid = (0, react_1.memo)((0, react_1.forwardRef)((props, forwardedRef) => {
    const { width: containerWidth = 800, height: containerHeight = 600, estimatedColumnWidth, estimatedRowHeight, rowHeight = defaultRowHeight, columnWidth = defaultColumnWidth, rowCount = 0, columnCount = 0, scrollbarSize = 13, onScroll, onImmediateScroll, showScrollbar = true, selectionBackgroundColor = "rgb(14, 101, 235, 0.1)", selectionBorderColor = "#1a73e8", selectionStrokeWidth = 1, activeCellStrokeWidth = 2, activeCell, selections = EMPTY_ARRAY, frozenRows = 0, frozenColumns = 0, itemRenderer = Cell_1.CellRenderer, enableCellOverlay = false, overlayRenderer = CellOverlay_1.CellRenderer, mergedCells = EMPTY_ARRAY, snap = false, scrollThrottleTimeout = 80, onViewChange, selectionRenderer = defaultSelectionRenderer, onBeforeRenderRow, showFrozenShadow = false, shadowSettings = defaultShadowSettings, borderStyles = EMPTY_ARRAY, children, stageProps, wrapper = (children) => children, cellAreas = EMPTY_ARRAY, showFillHandle = false, fillSelection, overscanCount = 1, fillHandleProps, fillhandleBorderColor = "white", showGridLines = false, gridLineColor = "#E3E2E2", gridLineWidth = 1, gridLineRenderer = defaultGridLineRenderer, isHiddenRow, isHiddenColumn, isHiddenCell, scale = 1, enableSelectionDrag = false, isDraggingSelection = false, ...rest } = props;
    (0, tiny_invariant_1.default)(!(children && typeof children !== "function"), "Children should be a function");
    /* Expose some methods in ref */
    (0, react_1.useImperativeHandle)(forwardedRef, () => {
        return {
            scrollTo,
            scrollBy,
            scrollToItem,
            stage: stageRef.current,
            container: containerRef.current,
            resetAfterIndices,
            getScrollPosition,
            isMergedCell,
            getCellBounds,
            getCellCoordsFromOffset,
            getCellOffsetFromCoords,
            getActualCellCoords,
            focus: focusContainer,
            resizeColumns,
            resizeRows,
            getViewPort,
            getRelativePositionFromOffset,
            scrollToTop,
            scrollToBottom,
            getDimensions,
            getRowOffset,
            getColumnOffset,
        };
    });
    const instanceProps = (0, react_1.useRef)({
        columnMetadataMap: {},
        rowMetadataMap: {},
        lastMeasuredColumnIndex: -1,
        lastMeasuredRowIndex: -1,
        estimatedColumnWidth: estimatedColumnWidth || DEFAULT_ESTIMATED_ITEM_SIZE,
        estimatedRowHeight: estimatedRowHeight || DEFAULT_ESTIMATED_ITEM_SIZE,
        recalcColumnIndices: [],
        recalcRowIndices: [],
    });
    const stageRef = (0, react_1.useRef)(null);
    const containerRef = (0, react_1.useRef)(null);
    const scrollContainerRef = (0, react_1.useRef)(null);
    const verticalScrollRef = (0, react_1.useRef)(null);
    const wheelingRef = (0, react_1.useRef)(null);
    const horizontalScrollRef = (0, react_1.useRef)(null);
    const [_, forceRender] = (0, react_1.useReducer)((s) => s + 1, 0);
    const [scrollState, setScrollState] = (0, react_1.useState)({
        scrollTop: 0,
        scrollLeft: 0,
        isScrolling: false,
        verticalScrollDirection: types_1.Direction.Down,
        horizontalScrollDirection: types_1.Direction.Right,
    });
    const scrollSnapRefs = (0, react_1.useRef)(null);
    const { scrollTop, scrollLeft, isScrolling, verticalScrollDirection, horizontalScrollDirection, } = scrollState;
    const isMounted = (0, react_1.useRef)(false);
    /* Focus container */
    const focusContainer = (0, react_1.useCallback)(() => {
        var _a;
        if (helpers_1.canUseDOM && document.activeElement !== containerRef.current) {
            return (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, []);
    /**
     * Get top offset of rowIndex
     */
    const getRowOffset = (0, react_1.useCallback)((index) => {
        return (0, helpers_1.getRowOffset)({
            index,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
            scale,
        });
    }, [rowHeight, columnWidth, instanceProps.current, scale]);
    /**
     * Get lefft offset of columnIndex
     */
    const getColumnOffset = (0, react_1.useCallback)((index) => {
        return (0, helpers_1.getColumnOffset)({
            index,
            rowHeight,
            columnWidth,
            instanceProps: instanceProps.current,
            scale,
        });
    }, [rowHeight, columnWidth, instanceProps.current, scale]);
    /**
     * Get height of rowIndex
     */
    const getRowHeight = (0, react_1.useCallback)((index) => {
        return (0, helpers_1.getRowHeight)(index, instanceProps.current);
    }, [instanceProps.current]);
    /**
     * Get height of columNiondex
     */
    const getColumnWidth = (0, react_1.useCallback)((index) => {
        return (0, helpers_1.getColumnWidth)(index, instanceProps.current);
    }, [instanceProps.current]);
    /**
     * onScroll callback
     */
    (0, react_1.useEffect)(() => {
        if (!isMounted.current)
            return;
        onScroll === null || onScroll === void 0 ? void 0 : onScroll({ scrollTop, scrollLeft });
    }, [scrollTop, scrollLeft]);
    /**
     * Handle mouse wheeel
     */
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = scrollContainerRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener("wheel", handleWheel, {
            passive: false,
        });
        isMounted.current = true;
        return () => {
            var _a;
            (_a = scrollContainerRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener("wheel", handleWheel);
        };
    }, []);
    /**
     * Imperatively get the current scroll position
     */
    const getScrollPosition = (0, react_1.useCallback)(() => {
        return {
            scrollTop,
            scrollLeft,
        };
    }, [scrollTop, scrollLeft]);
    /* Redraw grid imperatively */
    const resetAfterIndices = (0, react_1.useCallback)(({ columnIndex, rowIndex }, shouldForceUpdate = true) => {
        if (typeof columnIndex === "number") {
            instanceProps.current.recalcColumnIndices = [];
            instanceProps.current.lastMeasuredColumnIndex = Math.min(instanceProps.current.lastMeasuredColumnIndex, columnIndex - 1);
        }
        if (typeof rowIndex === "number") {
            instanceProps.current.recalcRowIndices = [];
            instanceProps.current.lastMeasuredRowIndex = Math.min(instanceProps.current.lastMeasuredRowIndex, rowIndex - 1);
        }
        if (shouldForceUpdate)
            forceRender();
    }, []);
    /**
     * Create a map of merged cells
     * [rowIndex, columnindex] => [parentRowIndex, parentColumnIndex]
     */
    const mergedCellMap = (0, react_1.useMemo)(() => {
        const mergedCellMap = new Map();
        for (let i = 0; i < mergedCells.length; i++) {
            const bounds = mergedCells[i];
            for (const cell of (0, helpers_1.getBoundedCells)(bounds)) {
                mergedCellMap.set(cell, bounds);
            }
        }
        return mergedCellMap;
    }, [mergedCells]);
    /* Check if a cell is part of a merged cell */
    const isMergedCell = (0, react_1.useCallback)(({ rowIndex, columnIndex }) => {
        return mergedCellMap.has((0, helpers_1.cellIdentifier)(rowIndex, columnIndex));
    }, [mergedCells]);
    /* Get top, left bounds of a cell */
    const getCellBounds = (0, react_1.useCallback)(({ rowIndex, columnIndex }, spanMerges = true) => {
        if (spanMerges) {
            const isMerged = isMergedCell({ rowIndex, columnIndex });
            if (isMerged)
                return mergedCellMap.get((0, helpers_1.cellIdentifier)(rowIndex, columnIndex));
        }
        return {
            top: rowIndex,
            left: columnIndex,
            right: columnIndex,
            bottom: rowIndex,
        };
    }, [mergedCellMap]);
    /* Get top, left bounds of a cell */
    const getActualCellCoords = (0, react_1.useCallback)(({ rowIndex, columnIndex }) => {
        const isMerged = isMergedCell({ rowIndex, columnIndex });
        if (isMerged) {
            const cell = mergedCellMap.get((0, helpers_1.cellIdentifier)(rowIndex, columnIndex));
            return {
                rowIndex: cell === null || cell === void 0 ? void 0 : cell.top,
                columnIndex: cell === null || cell === void 0 ? void 0 : cell.left,
            };
        }
        return {
            rowIndex,
            columnIndex,
        };
    }, [mergedCellMap]);
    const frozenColumnWidth = getColumnOffset(frozenColumns);
    const frozenRowHeight = getRowOffset(frozenRows);
    const [rowStartIndex, rowStopIndex, visibleRowStartIndex, visibleRowStopIndex,] = (0, react_1.useMemo)(() => {
        const startIndex = (0, helpers_1.getRowStartIndexForOffset)({
            rowHeight,
            columnWidth,
            rowCount,
            columnCount,
            instanceProps: instanceProps.current,
            offset: scrollTop + frozenRowHeight,
            scale,
        });
        const stopIndex = (0, helpers_1.getRowStopIndexForStartIndex)({
            startIndex,
            rowCount,
            rowHeight,
            columnWidth,
            scrollTop,
            containerHeight,
            instanceProps: instanceProps.current,
            scale,
        });
        // Overscan by one item in each direction so that tab/focus works.
        // If there isn't at least one extra item, tab loops back around.
        const overscanBackward = !isScrolling || verticalScrollDirection === types_1.Direction.Up
            ? Math.max(1, overscanCount)
            : 1;
        const overscanForward = !isScrolling || verticalScrollDirection === types_1.Direction.Down
            ? Math.max(1, overscanCount)
            : 1;
        return [
            Math.max(0, startIndex - overscanBackward),
            Math.max(0, Math.min(rowCount - 1, stopIndex + overscanForward)),
            startIndex,
            stopIndex,
        ];
    }, [
        rowHeight,
        columnWidth,
        rowCount,
        columnCount,
        scale,
        scrollTop,
        containerHeight,
        frozenRows,
        overscanCount,
        frozenRowHeight,
    ]);
    const [columnStartIndex, columnStopIndex, visibleColumnStartIndex, visibleColumnStopIndex,] = (0, react_1.useMemo)(() => {
        const startIndex = (0, helpers_1.getColumnStartIndexForOffset)({
            rowHeight,
            columnWidth,
            rowCount,
            columnCount,
            instanceProps: instanceProps.current,
            offset: scrollLeft + frozenColumnWidth,
            scale,
        });
        const stopIndex = (0, helpers_1.getColumnStopIndexForStartIndex)({
            startIndex,
            columnCount,
            rowHeight,
            columnWidth,
            scrollLeft,
            containerWidth,
            instanceProps: instanceProps.current,
            scale,
        });
        // Overscan by one item in each direction so that tab/focus works.
        // If there isn't at least one extra item, tab loops back around.
        const overscanBackward = !isScrolling || horizontalScrollDirection === types_1.Direction.Left
            ? Math.max(1, overscanCount)
            : 1;
        const overscanForward = !isScrolling || horizontalScrollDirection === types_1.Direction.Right
            ? Math.max(1, overscanCount)
            : 1;
        return [
            Math.max(0, startIndex - overscanBackward),
            Math.max(0, Math.min(columnCount - 1, stopIndex + overscanForward)),
            startIndex,
            stopIndex,
        ];
    }, [
        rowHeight,
        columnWidth,
        rowCount,
        columnCount,
        scale,
        frozenColumns,
        containerWidth,
        scrollLeft,
        frozenColumnWidth,
    ]);
    const estimatedTotalHeight = (0, helpers_1.getEstimatedTotalHeight)(rowCount, instanceProps.current);
    const estimatedTotalWidth = (0, helpers_1.getEstimatedTotalWidth)(columnCount, instanceProps.current);
    /* Method to get dimensions of the grid */
    const getDimensions = (0, react_1.useCallback)(() => {
        return {
            containerWidth,
            containerHeight,
            estimatedTotalWidth,
            estimatedTotalHeight,
        };
    }, [
        containerWidth,
        containerHeight,
        estimatedTotalWidth,
        estimatedTotalHeight,
    ]);
    /**
     * Update snap properties if its active
     * We need this because we are binding `onwheel` event to document
     * So props go stale
     */
    (0, react_1.useEffect)(() => {
        if (snap) {
            scrollSnapRefs.current = {
                visibleRowStartIndex,
                rowCount,
                frozenRows,
                visibleColumnStartIndex,
                columnCount,
                frozenColumns,
                isHiddenRow,
                isHiddenColumn,
            };
        }
    }, [
        snap,
        visibleRowStartIndex,
        rowCount,
        frozenRows,
        visibleColumnStartIndex,
        columnCount,
        frozenColumns,
        isHiddenRow,
        isHiddenColumn,
    ]);
    /**
     * Snaps vertical scrollbar to the next/prev visible row
     */
    const snapToRowFn = (0, react_1.useCallback)(({ deltaY }) => {
        if (!verticalScrollRef.current || !scrollSnapRefs.current)
            return;
        if (deltaY !== 0) {
            const direction = deltaY < 0 ? types_1.Direction.Up : types_1.Direction.Down;
            const { visibleRowStartIndex, rowCount, isHiddenRow } = scrollSnapRefs.current;
            let nextRowIndex = direction === types_1.Direction.Up
                ? // User is scrolling up
                    Math.max(0, visibleRowStartIndex - 1)
                : Math.min(visibleRowStartIndex, rowCount - 1);
            /* Ignore hidden row */
            nextRowIndex = (0, helpers_1.clampIndex)(nextRowIndex, isHiddenRow, direction);
            const rowHeight = getRowHeight(nextRowIndex);
            verticalScrollRef.current.scrollTop +=
                (direction === types_1.Direction.Up ? -1 : 1) * rowHeight;
        }
    }, []);
    /**
     * Snaps horizontal scrollbar to the next/prev visible column
     */
    const snapToColumnFn = (0, react_1.useCallback)(({ deltaX }) => {
        if (!horizontalScrollRef.current || !scrollSnapRefs.current)
            return;
        if (deltaX !== 0) {
            const { visibleColumnStartIndex, columnCount, isHiddenColumn } = scrollSnapRefs.current;
            const direction = deltaX < 0 ? types_1.Direction.Left : types_1.Direction.Right;
            let nextColumnIndex = direction === types_1.Direction.Left
                ? Math.max(0, visibleColumnStartIndex - 1)
                : Math.min(visibleColumnStartIndex, columnCount - 1);
            /* Ignore hidden column */
            nextColumnIndex = (0, helpers_1.clampIndex)(nextColumnIndex, isHiddenColumn, direction);
            const columnWidth = getColumnWidth(nextColumnIndex);
            horizontalScrollRef.current.scrollLeft +=
                (direction === types_1.Direction.Left ? -1 : 1) * columnWidth;
        }
    }, []);
    const snapToRowThrottler = (0, react_1.useRef)();
    const snapToColumnThrottler = (0, react_1.useRef)();
    /**
     * Register snap throttlers
     */
    (0, react_1.useEffect)(() => {
        if (snap) {
            snapToRowThrottler.current = (0, helpers_1.throttle)(snapToRowFn, scrollThrottleTimeout);
            snapToColumnThrottler.current = (0, helpers_1.throttle)(snapToColumnFn, scrollThrottleTimeout);
        }
        return () => {
            snapToRowThrottler.current = undefined;
            snapToColumnThrottler.current = undefined;
        };
    }, [snap]);
    /* Find frozen column boundary */
    const isWithinFrozenColumnBoundary = (0, react_1.useCallback)((x) => {
        return frozenColumns > 0 && x < frozenColumnWidth;
    }, [frozenColumns, frozenColumnWidth]);
    /* Find frozen row boundary */
    const isWithinFrozenRowBoundary = (0, react_1.useCallback)((y) => {
        return frozenRows > 0 && y < frozenRowHeight;
    }, [frozenRows, frozenRowHeight]);
    /**
     * Get relative mouse position
     */
    const getRelativePositionFromOffset = (0, react_1.useCallback)((left, top) => {
        var _a;
        (0, tiny_invariant_1.default)(typeof left === "number" && typeof top === "number", "Top and left should be a number");
        if (!stageRef.current)
            return null;
        const stage = stageRef.current.getStage();
        const rect = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (rect) {
            left = left - rect.x;
            top = top - rect.y;
        }
        const { x, y } = stage
            .getAbsoluteTransform()
            .copy()
            .invert()
            .point({ x: left, y: top });
        return { x, y };
    }, []);
    /**
     * Get cell cordinates from current mouse x/y positions
     */
    const getCellCoordsFromOffset = (0, react_1.useCallback)((left, top, includeFrozen = true) => {
        const pos = getRelativePositionFromOffset(left, top);
        if (!pos)
            return null;
        const { x, y } = pos;
        const rowOffset = includeFrozen && isWithinFrozenRowBoundary(y) ? y : y + scrollTop;
        const columnOffset = includeFrozen && isWithinFrozenColumnBoundary(x) ? x : x + scrollLeft;
        if (rowOffset > estimatedTotalHeight ||
            columnOffset > estimatedTotalWidth) {
            return null;
        }
        const rowIndex = (0, helpers_1.getRowStartIndexForOffset)({
            rowHeight,
            columnWidth,
            rowCount,
            columnCount,
            instanceProps: instanceProps.current,
            offset: rowOffset,
            scale,
        });
        const columnIndex = (0, helpers_1.getColumnStartIndexForOffset)({
            rowHeight,
            columnWidth,
            rowCount,
            columnCount,
            instanceProps: instanceProps.current,
            offset: columnOffset,
            scale,
        });
        /* To be compatible with merged cells */
        const bounds = getCellBounds({ rowIndex, columnIndex });
        return { rowIndex: bounds.top, columnIndex: bounds.left };
    }, [
        scrollLeft,
        rowHeight,
        columnWidth,
        scrollTop,
        rowCount,
        estimatedTotalHeight,
        estimatedTotalWidth,
        columnCount,
        mergedCellMap,
    ]);
    /**
     * Get cell offset position from rowIndex, columnIndex
     */
    const getCellOffsetFromCoords = (0, react_1.useCallback)((cell) => {
        const { top: rowIndex, left: columnIndex, right, bottom, } = getCellBounds(cell);
        const x = getColumnOffset(columnIndex);
        const y = getRowOffset(rowIndex);
        const width = getColumnOffset(right + 1) - x;
        const height = getRowOffset(bottom + 1) - y;
        return {
            x,
            y,
            width,
            height,
        };
    }, [mergedCellMap]);
    /**
     * Resize one or more columns
     */
    const resizeColumns = (0, react_1.useCallback)((indices) => {
        const leftMost = Math.min(...indices);
        instanceProps.current.recalcColumnIndices = indices;
        resetAfterIndices({ columnIndex: leftMost }, false);
        forceRender();
    }, []);
    /**
     * Resize one or more rows
     */
    const resizeRows = (0, react_1.useCallback)((indices) => {
        const topMost = Math.min(...indices);
        instanceProps.current.recalcRowIndices = indices;
        resetAfterIndices({ rowIndex: topMost }, false);
        forceRender();
    }, []);
    /* Always if the viewport changes */
    (0, react_1.useEffect)(() => {
        if (instanceProps.current.recalcColumnIndices.length) {
            instanceProps.current.recalcColumnIndices.length = 0;
        }
        if (instanceProps.current.recalcRowIndices.length) {
            instanceProps.current.recalcRowIndices.length = 0;
        }
    }, [rowStopIndex, columnStopIndex, scale]);
    /* Get current view port of the grid */
    const getViewPort = (0, react_1.useCallback)(() => {
        return {
            rowStartIndex,
            rowStopIndex,
            columnStartIndex,
            columnStopIndex,
            visibleRowStartIndex,
            visibleRowStopIndex,
            visibleColumnStartIndex,
            visibleColumnStopIndex,
        };
    }, [
        rowStartIndex,
        rowStopIndex,
        columnStartIndex,
        columnStopIndex,
        visibleRowStartIndex,
        visibleRowStopIndex,
        visibleColumnStartIndex,
        visibleColumnStopIndex,
    ]);
    /**
     * When the grid is scrolling,
     * 1. Stage does not listen to any mouse events
     * 2. Div container does not listen to pointer events
     */
    const resetIsScrollingTimeoutID = (0, react_1.useRef)(null);
    const resetIsScrollingDebounced = (0, react_1.useCallback)(() => {
        if (resetIsScrollingTimeoutID.current !== null) {
            (0, helpers_1.cancelTimeout)(resetIsScrollingTimeoutID.current);
        }
        resetIsScrollingTimeoutID.current = (0, helpers_1.requestTimeout)(resetIsScrolling, exports.RESET_SCROLL_EVENTS_DEBOUNCE_INTERVAL);
    }, []);
    /* Reset isScrolling */
    const resetIsScrolling = (0, react_1.useCallback)(() => {
        resetIsScrollingTimeoutID.current = null;
        setScrollState((prev) => {
            return {
                ...prev,
                isScrolling: false,
            };
        });
    }, []);
    /* Handle vertical scroll */
    const handleScroll = (0, react_1.useCallback)((e) => {
        const { scrollTop } = e.currentTarget;
        setScrollState((prev) => ({
            ...prev,
            isScrolling: true,
            verticalScrollDirection: prev.scrollTop > scrollTop ? types_1.Direction.Up : types_1.Direction.Down,
            scrollTop,
        }));
        /* Scroll callbacks */
        onImmediateScroll === null || onImmediateScroll === void 0 ? void 0 : onImmediateScroll({ scrollTop, scrollLeft });
        /* Reset isScrolling if required */
        resetIsScrollingDebounced();
    }, [scrollLeft]);
    /* Handle horizontal scroll */
    const handleScrollLeft = (0, react_1.useCallback)((e) => {
        const { scrollLeft } = e.currentTarget;
        setScrollState((prev) => ({
            ...prev,
            isScrolling: true,
            horizontalScrollDirection: prev.scrollLeft > scrollLeft ? types_1.Direction.Left : types_1.Direction.Right,
            scrollLeft,
        }));
        /* Scroll callbacks */
        onImmediateScroll === null || onImmediateScroll === void 0 ? void 0 : onImmediateScroll({ scrollLeft, scrollTop });
        /* Reset isScrolling if required */
        resetIsScrollingDebounced();
    }, [scrollTop]);
    /* Scroll based on left, top position */
    const scrollTo = (0, react_1.useCallback)(({ scrollTop, scrollLeft }) => {
        /* If scrollbar is visible, lets update it which triggers a state change */
        if (showScrollbar) {
            if (horizontalScrollRef.current && scrollLeft !== void 0)
                horizontalScrollRef.current.scrollLeft = scrollLeft;
            if (verticalScrollRef.current && scrollTop !== void 0)
                verticalScrollRef.current.scrollTop = scrollTop;
        }
        else {
            setScrollState((prev) => {
                return {
                    ...prev,
                    scrollLeft: scrollLeft == void 0 ? prev.scrollLeft : scrollLeft,
                    scrollTop: scrollTop == void 0 ? prev.scrollTop : scrollTop,
                };
            });
        }
    }, [showScrollbar]);
    /* Scroll grid to top */
    const scrollToTop = (0, react_1.useCallback)(() => {
        scrollTo({ scrollTop: 0, scrollLeft: 0 });
    }, []);
    /* Scroll grid to bottom */
    const scrollToBottom = (0, react_1.useCallback)(() => {
        scrollTo({ scrollTop: estimatedTotalHeight - containerHeight });
    }, [estimatedTotalHeight, containerHeight]);
    /**
     * Scrollby utility
     */
    const scrollBy = (0, react_1.useCallback)(({ x, y }) => {
        if (showScrollbar) {
            if (horizontalScrollRef.current && x !== void 0)
                horizontalScrollRef.current.scrollLeft += x;
            if (verticalScrollRef.current && y !== void 0)
                verticalScrollRef.current.scrollTop += y;
        }
        else {
            setScrollState((prev) => {
                return {
                    ...prev,
                    scrollLeft: x == void 0 ? prev.scrollLeft : prev.scrollLeft + x,
                    scrollTop: y == void 0 ? prev.scrollTop : prev.scrollTop + y,
                };
            });
        }
    }, []);
    /**
     * Scrolls to cell
     * Respects frozen rows and columns
     */
    const scrollToItem = (0, react_1.useCallback)(({ rowIndex, columnIndex }, align = helpers_1.Align.smart) => {
        const isFrozenRow = rowIndex !== void 0 && rowIndex < frozenRows;
        const isFrozenColumn = columnIndex !== void 0 && columnIndex < frozenColumns;
        const frozenColumnOffset = getColumnOffset(frozenColumns);
        /* Making sure getColumnWidth works */
        const x = columnIndex !== void 0 ? getColumnOffset(columnIndex) : void 0;
        /* Making sure getRowHeight works */
        const y = rowIndex !== void 0 ? getRowOffset(rowIndex) : void 0;
        const width = columnIndex !== void 0 ? getColumnWidth(columnIndex) : 0;
        const height = rowIndex !== void 0 ? getRowHeight(rowIndex) : 0;
        const columnAlign = width > containerWidth ? helpers_1.Align.start : align;
        const rowAlign = height > containerHeight ? helpers_1.Align.start : align;
        const newScrollLeft = columnIndex !== void 0 && !isFrozenColumn
            ? (0, helpers_1.getOffsetForColumnAndAlignment)({
                index: columnIndex,
                containerHeight,
                containerWidth,
                columnCount,
                columnWidth,
                rowCount,
                rowHeight,
                scrollOffset: scrollLeft,
                instanceProps: instanceProps.current,
                scrollbarSize,
                frozenOffset: frozenColumnOffset,
                align: columnAlign,
                scale,
                estimatedTotalWidth,
                estimatedTotalHeight,
            })
            : void 0;
        const frozenRowOffset = getRowOffset(frozenRows);
        const newScrollTop = rowIndex !== void 0 && !isFrozenRow
            ? (0, helpers_1.getOffsetForRowAndAlignment)({
                index: rowIndex,
                containerHeight,
                containerWidth,
                columnCount,
                columnWidth,
                rowCount,
                rowHeight,
                scrollOffset: scrollTop,
                instanceProps: instanceProps.current,
                scrollbarSize,
                frozenOffset: frozenRowOffset,
                align: rowAlign,
                scale,
                estimatedTotalWidth,
                estimatedTotalHeight,
            })
            : void 0;
        const coords = {
            scrollLeft: newScrollLeft,
            scrollTop: newScrollTop,
        };
        const isOutsideViewport = (rowIndex !== void 0 &&
            rowIndex > rowStopIndex + (rowStopIndex - rowStartIndex)) ||
            (columnIndex !== void 0 &&
                columnIndex >
                    columnStopIndex + (columnStopIndex - columnStartIndex));
        /* Scroll in the next frame, Useful when user wants to jump from 1st column to last */
        if (isOutsideViewport) {
            window.requestAnimationFrame(() => {
                scrollTo(coords);
            });
        }
        else
            scrollTo(coords);
    }, [
        containerHeight,
        containerWidth,
        estimatedTotalWidth,
        estimatedTotalHeight,
        rowCount,
        columnCount,
        scrollbarSize,
        scrollLeft,
        scrollTop,
        frozenRows,
        frozenColumns,
    ]);
    /**
     * Fired when user tries to scroll the canvas
     */
    const handleWheel = (0, react_1.useCallback)((event) => {
        var _a, _b, _c, _d;
        /* If user presses shift key, scroll horizontally */
        const isScrollingHorizontally = event.shiftKey;
        /* Prevent browser back in Mac */
        event.preventDefault();
        const { deltaX, deltaY, deltaMode } = event;
        /* Scroll natively */
        if (wheelingRef.current)
            return;
        const isMac = /Mac/i.test(navigator.userAgent);
        let dx = isScrollingHorizontally ? (isMac ? deltaX : deltaY) : deltaX;
        // let dx = isScrollingHorizontally ? deltaY : deltaX;
        let dy = deltaY;
        /* Scroll only in one direction */
        const isHorizontal = isScrollingHorizontally || Math.abs(dx) > Math.abs(dy);
        /* If snaps are active */
        if (snap) {
            if (isHorizontal) {
                (_a = snapToColumnThrottler.current) === null || _a === void 0 ? void 0 : _a.call(snapToColumnThrottler, {
                    deltaX,
                });
            }
            else {
                (_b = snapToRowThrottler.current) === null || _b === void 0 ? void 0 : _b.call(snapToRowThrottler, {
                    deltaY,
                });
            }
            return;
        }
        if (deltaMode === 1) {
            dy = dy * scrollbarSize;
        }
        if (!horizontalScrollRef.current || !verticalScrollRef.current)
            return;
        const currentScroll = isHorizontal
            ? (_c = horizontalScrollRef.current) === null || _c === void 0 ? void 0 : _c.scrollLeft
            : (_d = verticalScrollRef.current) === null || _d === void 0 ? void 0 : _d.scrollTop;
        wheelingRef.current = window.requestAnimationFrame(() => {
            wheelingRef.current = null;
            if (isHorizontal) {
                if (horizontalScrollRef.current)
                    horizontalScrollRef.current.scrollLeft = currentScroll + dx;
            }
            else {
                if (verticalScrollRef.current)
                    verticalScrollRef.current.scrollTop = currentScroll + dy;
            }
        });
    }, []);
    /* Callback when visible rows or columns have changed */
    (0, react_1.useEffect)(() => {
        onViewChange === null || onViewChange === void 0 ? void 0 : onViewChange({
            rowStartIndex,
            rowStopIndex,
            columnStartIndex,
            columnStopIndex,
            visibleRowStartIndex,
            visibleRowStopIndex,
            visibleColumnStartIndex,
            visibleColumnStopIndex,
        });
    }, [
        rowStartIndex,
        rowStopIndex,
        columnStartIndex,
        columnStopIndex,
        visibleRowStartIndex,
        visibleRowStopIndex,
        visibleColumnStartIndex,
        visibleColumnStopIndex,
    ]);
    /* Draw gridlines */
    const gridLines = [];
    const gridLinesFrozenRow = [];
    const gridLinesFrozenColumn = [];
    const gridLinesFrozenIntersection = [];
    if (showGridLines) {
        // Horizontal
        for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
            /* Ignore frozen rows */
            if (rowIndex < frozenRows || (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex)))
                continue;
            const x1 = getColumnOffset(frozenColumns);
            const x2 = getColumnOffset(Math.min(columnStopIndex + 1, columnCount));
            const y1 = getRowOffset(Math.min(rowIndex + 1, rowCount));
            const y2 = y1;
            gridLines.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetY: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: rowIndex, columnIndex: y1 }),
            }));
            gridLinesFrozenColumn.push(gridLineRenderer({
                points: [0, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetY: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: rowIndex, columnIndex: y1 }),
            }));
        }
        // Vertical
        for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
            const x1 = getColumnOffset(Math.min(columnIndex + 1, columnCount));
            const x2 = x1;
            const y1 = getRowOffset(frozenRows);
            const y2 = getRowOffset(Math.min(rowStopIndex + 1, rowCount));
            gridLines.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetX: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: x1, columnIndex: columnIndex }),
            }));
            gridLinesFrozenRow.push(gridLineRenderer({
                points: [x1, 0, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetX: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: x1, columnIndex: columnIndex }),
            }));
        }
        for (let rowIndex = 0; rowIndex < Math.min(columnStopIndex, frozenRows); rowIndex++) {
            if (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex))
                continue;
            const x1 = 0;
            const x2 = getColumnOffset(Math.min(columnStopIndex + 1, columnCount));
            const y1 = getRowOffset(Math.min(rowIndex + 1, rowCount));
            const y2 = y1;
            gridLinesFrozenRow.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetY: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: rowIndex, columnIndex: y1 }),
            }));
            gridLinesFrozenIntersection.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetY: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: rowIndex, columnIndex: y1 }),
            }));
        }
        for (let columnIndex = 0; columnIndex < Math.min(columnStopIndex, frozenColumns); columnIndex++) {
            const x1 = getColumnOffset(Math.min(columnIndex + 1, columnCount));
            const x2 = x1;
            const y1 = 0;
            const y2 = getRowOffset(Math.min(rowStopIndex + 1, rowCount));
            gridLinesFrozenColumn.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetX: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: x1, columnIndex: columnIndex }),
            }));
            gridLinesFrozenIntersection.push(gridLineRenderer({
                points: [x1, y1, x2, y2],
                stroke: gridLineColor,
                strokeWidth: gridLineWidth,
                offsetX: -0.5,
                key: (0, helpers_1.itemKey)({ rowIndex: x1, columnIndex: columnIndex }),
            }));
        }
    }
    const mergedCellRenderMap = new Set();
    /* Draw all cells */
    const cells = [];
    /**
     * Lets users draw cells on top of existing canvas
     */
    const cellOverlays = [];
    if (columnCount > 0 && rowCount) {
        for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
            /* Skip frozen rows */
            if (rowIndex < frozenRows || (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex))) {
                continue;
            }
            /**
             * Do any pre-processing of the row before being renderered.
             * Useful for `react-table` to call `prepareRow(row)`
             */
            onBeforeRenderRow === null || onBeforeRenderRow === void 0 ? void 0 : onBeforeRenderRow(rowIndex);
            for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
                /**
                 * Skip frozen columns
                 * Skip merged cells that are out of bounds
                 */
                if (columnIndex < frozenColumns) {
                    continue;
                }
                const isMerged = isMergedCell({ rowIndex, columnIndex });
                const bounds = getCellBounds({ rowIndex, columnIndex });
                const actualRowIndex = isMerged ? bounds.top : rowIndex;
                const actualColumnIndex = isMerged ? bounds.left : columnIndex;
                const actualBottom = Math.max(rowIndex, bounds.bottom);
                const actualRight = Math.max(columnIndex, bounds.right);
                if (!isMerged && (isHiddenCell === null || isHiddenCell === void 0 ? void 0 : isHiddenCell(actualRowIndex, actualColumnIndex))) {
                    continue;
                }
                if (isMerged) {
                    const cellId = (0, helpers_1.cellIdentifier)(bounds.top, bounds.left);
                    if (mergedCellRenderMap.has(cellId)) {
                        continue;
                    }
                    mergedCellRenderMap.add(cellId);
                }
                const y = getRowOffset(actualRowIndex);
                const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
                const x = getColumnOffset(actualColumnIndex);
                const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
                cells.push(itemRenderer({
                    x,
                    y,
                    width,
                    height,
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                    isMergedCell: isMerged,
                    key: (0, helpers_1.itemKey)({
                        rowIndex: actualRowIndex,
                        columnIndex: actualColumnIndex,
                    }),
                }));
                if (enableCellOverlay) {
                    cellOverlays.push(overlayRenderer({
                        x,
                        y,
                        width,
                        height,
                        rowIndex: actualRowIndex,
                        columnIndex: actualColumnIndex,
                        isMergedCell: isMerged,
                        key: (0, helpers_1.itemKey)({
                            rowIndex: actualRowIndex,
                            columnIndex: actualColumnIndex,
                        }),
                    }));
                }
            }
        }
    }
    /**
     * Extend certain cells.
     * Mimics google sheets functionality where
     * oevrflowed cell content can cover adjacent cells
     */
    const ranges = [];
    for (const { rowIndex, columnIndex, toColumnIndex } of cellAreas) {
        /* Skip merged cells, Merged  cell cannot be extended */
        if (rowIndex < frozenRows ||
            columnIndex < frozenColumns ||
            isMergedCell({ rowIndex, columnIndex }) ||
            (isHiddenCell === null || isHiddenCell === void 0 ? void 0 : isHiddenCell(rowIndex, columnIndex))) {
            continue;
        }
        const x = getColumnOffset(columnIndex);
        const y = getRowOffset(rowIndex);
        const height = getRowHeight(rowIndex);
        const { x: offsetX = 0 } = getCellOffsetFromCoords({
            rowIndex,
            columnIndex: toColumnIndex + 1,
        });
        ranges.push(itemRenderer({
            x,
            y,
            width: offsetX - x,
            height,
            rowIndex,
            columnIndex,
            key: `range:${(0, helpers_1.itemKey)({ rowIndex, columnIndex })}`,
        }));
    }
    /* Draw frozen rows */
    const frozenRowCells = [];
    const frozenRowCellOverlays = [];
    for (let rowIndex = 0; rowIndex < Math.min(rowStopIndex, frozenRows); rowIndex++) {
        if (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex))
            continue;
        /**
         * Do any pre-processing of the row before being renderered.
         * Useful for `react-table` to call `prepareRow(row)`
         */
        onBeforeRenderRow === null || onBeforeRenderRow === void 0 ? void 0 : onBeforeRenderRow(rowIndex);
        for (let columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
            /* Skip merged cells columns */
            if (columnIndex < frozenColumns) {
                continue;
            }
            const isMerged = isMergedCell({ rowIndex, columnIndex });
            const bounds = getCellBounds({ rowIndex, columnIndex });
            const actualRowIndex = isMerged ? bounds.top : rowIndex;
            const actualColumnIndex = isMerged ? bounds.left : columnIndex;
            const actualBottom = Math.max(rowIndex, bounds.bottom);
            const actualRight = Math.max(columnIndex, bounds.right);
            if (!isMerged && (isHiddenCell === null || isHiddenCell === void 0 ? void 0 : isHiddenCell(actualRowIndex, actualColumnIndex))) {
                continue;
            }
            if (isMerged) {
                const cellId = (0, helpers_1.cellIdentifier)(bounds.top, bounds.left);
                if (mergedCellRenderMap.has(cellId)) {
                    continue;
                }
                mergedCellRenderMap.add(cellId);
            }
            const y = getRowOffset(actualRowIndex);
            const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
            const x = getColumnOffset(actualColumnIndex);
            const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
            frozenRowCells.push(itemRenderer({
                x,
                y,
                width,
                height,
                rowIndex: actualRowIndex,
                columnIndex: actualColumnIndex,
                isMergedCell: isMerged,
                key: (0, helpers_1.itemKey)({
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                }),
            }));
            if (enableCellOverlay) {
                frozenRowCellOverlays.push(overlayRenderer({
                    x,
                    y,
                    width,
                    height,
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                    isMergedCell: isMerged,
                    key: (0, helpers_1.itemKey)({
                        rowIndex: actualRowIndex,
                        columnIndex: actualColumnIndex,
                    }),
                }));
            }
        }
    }
    /* Draw frozen columns */
    const frozenColumnCells = [];
    const frozenColumnCellOverlays = [];
    for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
        if (rowIndex < frozenRows || (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex))) {
            continue;
        }
        /**
         * Do any pre-processing of the row before being renderered.
         * Useful for `react-table` to call `prepareRow(row)`
         */
        onBeforeRenderRow === null || onBeforeRenderRow === void 0 ? void 0 : onBeforeRenderRow(rowIndex);
        for (let columnIndex = 0; columnIndex < Math.min(columnStopIndex, frozenColumns); columnIndex++) {
            const isMerged = isMergedCell({ rowIndex, columnIndex });
            const bounds = getCellBounds({ rowIndex, columnIndex });
            const actualRowIndex = isMerged ? bounds.top : rowIndex;
            const actualColumnIndex = isMerged ? bounds.left : columnIndex;
            const actualBottom = Math.max(rowIndex, bounds.bottom);
            const actualRight = Math.max(columnIndex, bounds.right);
            if (!isMerged && (isHiddenCell === null || isHiddenCell === void 0 ? void 0 : isHiddenCell(actualRowIndex, actualColumnIndex))) {
                continue;
            }
            if (isMerged) {
                const cellId = (0, helpers_1.cellIdentifier)(bounds.top, bounds.left);
                if (mergedCellRenderMap.has(cellId)) {
                    continue;
                }
                mergedCellRenderMap.add(cellId);
            }
            const y = getRowOffset(actualRowIndex);
            const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
            const x = getColumnOffset(actualColumnIndex);
            const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
            frozenColumnCells.push(itemRenderer({
                x,
                y,
                width,
                height,
                rowIndex: actualRowIndex,
                columnIndex: actualColumnIndex,
                isMergedCell: isMerged,
                key: (0, helpers_1.itemKey)({
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                }),
            }));
            if (enableCellOverlay) {
                frozenColumnCellOverlays.push(overlayRenderer({
                    x,
                    y,
                    width,
                    height,
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                    isMergedCell: isMerged,
                    key: (0, helpers_1.itemKey)({
                        rowIndex: actualRowIndex,
                        columnIndex: actualColumnIndex,
                    }),
                }));
            }
        }
    }
    /**
     * Frozen column shadow
     */
    const frozenColumnShadow = (0, react_1.useMemo)(() => {
        const frozenColumnLineX = getColumnOffset(frozenColumns);
        const frozenColumnLineY = getRowOffset(Math.min(rowStopIndex + 1, rowCount));
        return (react_1.default.createElement(react_konva_1.Line, { points: [frozenColumnLineX, 0, frozenColumnLineX, frozenColumnLineY], offsetX: -0.5, strokeWidth: 1, shadowForStrokeEnabled: false, strokeScaleEnabled: false, hitStrokeWidth: 0, listening: false, perfectDrawEnabled: false, ...shadowSettings }));
    }, [
        shadowSettings,
        frozenColumns,
        rowStopIndex,
        rowCount,
        instanceProps.current.lastMeasuredColumnIndex,
        instanceProps.current.recalcColumnIndices,
    ]);
    /**
     * Frozen row shadow
     */
    const frozenRowShadow = (0, react_1.useMemo)(() => {
        const frozenRowLineY = getRowOffset(frozenRows);
        const frozenRowLineX = getColumnOffset(Math.min(columnStopIndex + 1, columnCount));
        return (react_1.default.createElement(react_konva_1.Line, { points: [0, frozenRowLineY, frozenRowLineX, frozenRowLineY], offsetY: -0.5, strokeWidth: 1, shadowForStrokeEnabled: false, strokeScaleEnabled: false, hitStrokeWidth: 0, listening: false, perfectDrawEnabled: false, ...shadowSettings }));
    }, [
        shadowSettings,
        frozenRows,
        columnStopIndex,
        columnCount,
        instanceProps.current.lastMeasuredRowIndex,
        instanceProps.current.recalcRowIndices,
    ]);
    /* Draw frozen intersection cells */
    const frozenIntersectionCells = [];
    const frozenIntersectionCellOverlays = [];
    for (let rowIndex = 0; rowIndex < Math.min(rowStopIndex, frozenRows); rowIndex++) {
        if (isHiddenRow === null || isHiddenRow === void 0 ? void 0 : isHiddenRow(rowIndex))
            continue;
        for (let columnIndex = 0; columnIndex < Math.min(columnStopIndex, frozenColumns); columnIndex++) {
            const isMerged = isMergedCell({ rowIndex, columnIndex });
            const bounds = getCellBounds({ rowIndex, columnIndex });
            const actualRowIndex = isMerged ? bounds.top : rowIndex;
            const actualColumnIndex = isMerged ? bounds.left : columnIndex;
            const actualBottom = Math.max(rowIndex, bounds.bottom);
            const actualRight = Math.max(columnIndex, bounds.right);
            if (!isMerged && (isHiddenCell === null || isHiddenCell === void 0 ? void 0 : isHiddenCell(actualRowIndex, actualColumnIndex))) {
                continue;
            }
            if (isMerged) {
                const cellId = (0, helpers_1.cellIdentifier)(bounds.top, bounds.left);
                if (mergedCellRenderMap.has(cellId)) {
                    continue;
                }
                mergedCellRenderMap.add(cellId);
            }
            const y = getRowOffset(actualRowIndex);
            const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
            const x = getColumnOffset(actualColumnIndex);
            const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
            frozenIntersectionCells.push(itemRenderer({
                x,
                y,
                width,
                height,
                rowIndex: actualRowIndex,
                columnIndex: actualColumnIndex,
                isMergedCell: isMerged,
                key: (0, helpers_1.itemKey)({
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                }),
            }));
            if (enableCellOverlay) {
                frozenIntersectionCellOverlays.push(overlayRenderer({
                    x,
                    y,
                    width,
                    height,
                    rowIndex: actualRowIndex,
                    columnIndex: actualColumnIndex,
                    isMergedCell: isMerged,
                    key: (0, helpers_1.itemKey)({
                        rowIndex: actualRowIndex,
                        columnIndex: actualColumnIndex,
                    }),
                }));
            }
        }
    }
    /**
     * Renders active cell
     */
    let fillHandleDimension = {};
    let activeCellSelection = null;
    let activeCellSelectionFrozenColumn = null;
    let activeCellSelectionFrozenRow = null;
    let activeCellSelectionFrozenIntersection = null;
    if (activeCell) {
        const bounds = getCellBounds(activeCell);
        const { top, left, right, bottom } = bounds;
        const actualBottom = Math.min(rowStopIndex, bottom);
        const actualRight = Math.min(columnStopIndex, right);
        const isInFrozenColumn = left < frozenColumns;
        const isInFrozenRow = top < frozenRows;
        const isInFrozenIntersection = isInFrozenRow && isInFrozenColumn;
        const y = getRowOffset(top);
        const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
        const x = getColumnOffset(left);
        const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
        const cell = selectionRenderer({
            stroke: selectionBorderColor,
            strokeWidth: activeCellStrokeWidth,
            fill: "transparent",
            x: x,
            y: y,
            width: width,
            height: height,
            type: "activeCell",
            key: 0,
            activeCell,
            isDragging: isDraggingSelection,
            /* Active cell is draggable only there are no other selections */
            draggable: enableSelectionDrag && !selections.length,
        });
        if (isInFrozenIntersection) {
            activeCellSelectionFrozenIntersection = cell;
        }
        else if (isInFrozenRow) {
            activeCellSelectionFrozenRow = cell;
        }
        else if (isInFrozenColumn) {
            activeCellSelectionFrozenColumn = cell;
        }
        else {
            activeCellSelection = cell;
        }
        fillHandleDimension = {
            x: x + width,
            y: y + height,
        };
    }
    /**
     * Convert selections to area
     * Removed useMemo as changes to lastMeasureRowIndex, lastMeasuredColumnIndex,
     * does not trigger useMemo
     * Dependencies : [selections, rowStopIndex, columnStopIndex, instanceProps]
     */
    let isSelectionInProgress = false;
    const selectionAreas = [];
    const selectionAreasFrozenColumns = [];
    const selectionAreasFrozenRows = [];
    const selectionAreasIntersection = [];
    for (let i = 0; i < selections.length; i++) {
        const selection = selections[i];
        const { bounds, inProgress, style } = selection;
        const { top, left, right, bottom } = bounds;
        const selectionBounds = { x: 0, y: 0, width: 0, height: 0 };
        const actualBottom = Math.min(rowStopIndex, bottom);
        const actualRight = Math.min(columnStopIndex, right);
        const isLeftBoundFrozen = left < frozenColumns;
        const isTopBoundFrozen = top < frozenRows;
        const isIntersectionFrozen = top < frozenRows && left < frozenColumns;
        const isLast = i === selections.length - 1;
        const styles = {
            stroke: inProgress ? selectionBackgroundColor : selectionBorderColor,
            fill: selectionBackgroundColor,
            strokeWidth: isDraggingSelection ? 0 : 1,
            isDragging: isDraggingSelection,
            draggable: inProgress ? false : enableSelectionDrag,
            ...style,
        };
        /**
         * If selection is in progress,
         * use this variable to hide fill handle
         */
        if (inProgress) {
            isSelectionInProgress = true;
        }
        selectionBounds.y = getRowOffset(top);
        selectionBounds.height =
            getRowOffset(actualBottom) -
                selectionBounds.y +
                getRowHeight(actualBottom);
        selectionBounds.x = getColumnOffset(left);
        selectionBounds.width =
            getColumnOffset(actualRight) -
                selectionBounds.x +
                getColumnWidth(actualRight);
        if (isLeftBoundFrozen) {
            const frozenColumnSelectionWidth = getColumnOffset(Math.min(right + 1, frozenColumns)) -
                getColumnOffset(left);
            selectionAreasFrozenColumns.push(selectionRenderer({
                ...styles,
                type: "selection",
                key: i,
                x: selectionBounds.x,
                y: selectionBounds.y,
                width: frozenColumnSelectionWidth,
                height: selectionBounds.height,
                strokeRightWidth: frozenColumnSelectionWidth === selectionBounds.width &&
                    !isDraggingSelection
                    ? selectionStrokeWidth
                    : 0,
                selection,
                inProgress,
            }));
        }
        if (isTopBoundFrozen) {
            const frozenRowSelectionHeight = getRowOffset(Math.min(bottom + 1, frozenRows)) - getRowOffset(top);
            selectionAreasFrozenRows.push(selectionRenderer({
                ...styles,
                type: "selection",
                key: i,
                x: selectionBounds.x,
                y: selectionBounds.y,
                width: selectionBounds.width,
                height: frozenRowSelectionHeight,
                strokeBottomWidth: frozenRowSelectionHeight === selectionBounds.height &&
                    !isDraggingSelection
                    ? selectionStrokeWidth
                    : 0,
                selection,
                inProgress,
            }));
        }
        if (isIntersectionFrozen) {
            const frozenIntersectionSelectionHeight = getRowOffset(Math.min(bottom + 1, frozenRows)) - getRowOffset(top);
            const frozenIntersectionSelectionWidth = getColumnOffset(Math.min(right + 1, frozenColumns)) -
                getColumnOffset(left);
            selectionAreasIntersection.push(selectionRenderer({
                ...styles,
                type: "selection",
                key: i,
                x: selectionBounds.x,
                y: selectionBounds.y,
                width: frozenIntersectionSelectionWidth,
                height: frozenIntersectionSelectionHeight,
                strokeBottomWidth: frozenIntersectionSelectionHeight === selectionBounds.height &&
                    !isDraggingSelection
                    ? selectionStrokeWidth
                    : 0,
                strokeRightWidth: frozenIntersectionSelectionWidth === selectionBounds.width &&
                    !isDraggingSelection
                    ? selectionStrokeWidth
                    : 0,
                selection,
                inProgress,
            }));
        }
        selectionAreas.push(selectionRenderer({
            ...styles,
            type: "selection",
            key: i,
            x: selectionBounds.x,
            y: selectionBounds.y,
            width: selectionBounds.width,
            height: selectionBounds.height,
            selection,
            inProgress,
        }));
        if (isLast) {
            fillHandleDimension = {
                x: selectionBounds.x + selectionBounds.width,
                y: selectionBounds.y + selectionBounds.height,
            };
        }
    }
    /**
     * Fillselection
     */
    let fillSelections = null;
    if (fillSelection) {
        const { bounds } = fillSelection;
        const { top, left, right, bottom } = bounds;
        const actualBottom = Math.min(rowStopIndex, bottom);
        const actualRight = Math.min(columnStopIndex, right);
        const x = getColumnOffset(left);
        const y = getRowOffset(top);
        const height = getRowOffset(actualBottom) - y + getRowHeight(actualBottom);
        const width = getColumnOffset(actualRight) - x + getColumnWidth(actualRight);
        fillSelections = selectionRenderer({
            type: "fill",
            x,
            y,
            width,
            height,
            key: -1,
            stroke: "gray",
            strokeStyle: "dashed",
        });
    }
    const borderStyleCells = [];
    const borderStyleCellsFrozenColumns = [];
    const borderStyleCellsFrozenRows = [];
    const borderStyleCellsIntersection = [];
    for (let i = 0; i < borderStyles.length; i++) {
        const { bounds, style, title, ...rest } = borderStyles[i];
        const { top, right, bottom, left } = bounds;
        const isLeftBoundFrozen = left < frozenColumns;
        const isTopBoundFrozen = top < frozenRows;
        const isIntersectionFrozen = top < frozenRows && left < frozenColumns;
        const x = getColumnOffset(left);
        const y = getRowOffset(top);
        const width = getColumnOffset(Math.min(columnCount, right + 1)) - x;
        const height = getRowOffset(Math.min(rowCount, bottom + 1)) - y;
        borderStyleCells.push((0, utils_1.createHTMLBox)({
            ...rest,
            ...style,
            x,
            y,
            key: i,
            width,
            height,
            type: "border",
        }));
        if (isLeftBoundFrozen) {
            const frozenColumnSelectionWidth = getColumnOffset(Math.min(right + 1, frozenColumns)) -
                getColumnOffset(left);
            borderStyleCellsFrozenColumns.push((0, utils_1.createHTMLBox)({
                ...rest,
                ...style,
                type: "border",
                x,
                y,
                key: i,
                width: frozenColumnSelectionWidth,
                height,
                strokeRightWidth: frozenColumnSelectionWidth === width
                    ? (style === null || style === void 0 ? void 0 : style.strokeRightWidth) || (style === null || style === void 0 ? void 0 : style.strokeWidth)
                    : 0,
            }));
        }
        if (isTopBoundFrozen) {
            const frozenRowSelectionHeight = getRowOffset(Math.min(bottom + 1, frozenRows)) - getRowOffset(top);
            borderStyleCellsFrozenRows.push((0, utils_1.createHTMLBox)({
                ...rest,
                ...style,
                type: "border",
                x,
                y,
                key: i,
                width,
                height: frozenRowSelectionHeight,
                strokeBottomWidth: frozenRowSelectionHeight === height
                    ? (style === null || style === void 0 ? void 0 : style.strokeBottomWidth) || (style === null || style === void 0 ? void 0 : style.strokeWidth)
                    : 0,
            }));
        }
        if (isIntersectionFrozen) {
            const frozenIntersectionSelectionHeight = getRowOffset(Math.min(bottom + 1, frozenRows)) - getRowOffset(top);
            const frozenIntersectionSelectionWidth = getColumnOffset(Math.min(right + 1, frozenColumns)) -
                getColumnOffset(left);
            borderStyleCellsIntersection.push((0, utils_1.createHTMLBox)({
                ...rest,
                ...style,
                type: "border",
                x,
                y,
                key: i,
                width: frozenIntersectionSelectionWidth,
                height: frozenIntersectionSelectionHeight,
                strokeBottomWidth: frozenIntersectionSelectionHeight === height
                    ? selectionStrokeWidth
                    : 0,
                strokeRightWidth: frozenIntersectionSelectionWidth === width
                    ? selectionStrokeWidth
                    : 0,
            }));
        }
    }
    /* Spacing for frozen row/column clip */
    const frozenSpacing = 1;
    /**
     * Prevents drawing hit region when scrolling
     */
    const listenToEvents = !isScrolling;
    /* Frozen row shadow */
    const frozenRowShadowComponent = showFrozenShadow && frozenRows !== 0 ? frozenRowShadow : null;
    /* Frozen column shadow */
    const frozenColumnShadowComponent = showFrozenShadow && frozenColumns !== 0 ? frozenColumnShadow : null;
    const stageChildren = (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_konva_1.Layer, null,
            react_1.default.createElement(react_konva_1.Group, { clipX: frozenColumnWidth, clipY: frozenRowHeight, clipWidth: containerWidth - frozenColumnWidth, clipHeight: containerHeight - frozenRowHeight },
                react_1.default.createElement(react_konva_1.Group, { offsetY: scrollTop, offsetX: scrollLeft },
                    gridLines,
                    cells,
                    cellOverlays,
                    ranges)),
            react_1.default.createElement(react_konva_1.Group, { clipX: frozenColumnWidth, clipY: 0, clipWidth: containerWidth - frozenColumnWidth, clipHeight: frozenRowHeight + frozenSpacing },
                react_1.default.createElement(react_konva_1.Group, { offsetY: 0, offsetX: scrollLeft },
                    gridLinesFrozenRow,
                    frozenRowCells,
                    frozenRowShadowComponent,
                    frozenRowCellOverlays)),
            react_1.default.createElement(react_konva_1.Group, { clipX: 0, clipY: frozenRowHeight, clipWidth: frozenColumnWidth + frozenSpacing, clipHeight: containerHeight - frozenRowHeight },
                react_1.default.createElement(react_konva_1.Group, { offsetY: scrollTop, offsetX: 0 },
                    gridLinesFrozenColumn,
                    frozenColumnCells,
                    frozenColumnShadowComponent,
                    frozenColumnCellOverlays)),
            react_1.default.createElement(react_konva_1.Group, { offsetY: 0, offsetX: 0, clipX: 0, clipY: 0, clipWidth: frozenColumnWidth + frozenSpacing, clipHeight: frozenRowHeight + frozenSpacing },
                gridLinesFrozenIntersection,
                frozenIntersectionCells,
                frozenRowShadowComponent,
                frozenColumnShadowComponent,
                frozenIntersectionCellOverlays)),
        children && typeof children === "function"
            ? children({
                scrollLeft,
                scrollTop,
            })
            : null));
    const fillHandleWidth = 8;
    const fillhandleComponent = showFillHandle && !isSelectionInProgress ? (react_1.default.createElement(FillHandle_1.default, { ...fillHandleDimension, stroke: selectionBorderColor, size: fillHandleWidth, borderColor: fillhandleBorderColor, ...fillHandleProps })) : null;
    const selectionChildren = (react_1.default.createElement("div", { style: {
            pointerEvents: "none",
        } },
        react_1.default.createElement("div", { style: {
                position: "absolute",
                left: frozenColumnWidth,
                top: frozenRowHeight,
                right: 0,
                bottom: 0,
                overflow: "hidden",
            } },
            react_1.default.createElement("div", { style: {
                    transform: `translate(-${scrollLeft + frozenColumnWidth}px, -${scrollTop + frozenRowHeight}px)`,
                } },
                borderStyleCells,
                fillSelections,
                selectionAreas,
                activeCellSelection,
                fillhandleComponent)),
        frozenColumns ? (react_1.default.createElement("div", { style: {
                position: "absolute",
                width: frozenColumnWidth + fillHandleWidth,
                top: frozenRowHeight,
                left: 0,
                bottom: 0,
                overflow: "hidden",
            } },
            react_1.default.createElement("div", { style: {
                    transform: `translate(0, -${scrollTop + frozenRowHeight}px)`,
                } },
                borderStyleCellsFrozenColumns,
                selectionAreasFrozenColumns,
                activeCellSelectionFrozenColumn,
                fillhandleComponent))) : null,
        frozenRows ? (react_1.default.createElement("div", { style: {
                position: "absolute",
                height: frozenRowHeight + fillHandleWidth,
                left: frozenColumnWidth,
                right: 0,
                top: 0,
                overflow: "hidden",
            } },
            react_1.default.createElement("div", { style: {
                    transform: `translate(-${scrollLeft + frozenColumnWidth}px, 0)`,
                } },
                borderStyleCellsFrozenRows,
                selectionAreasFrozenRows,
                activeCellSelectionFrozenRow,
                fillhandleComponent))) : null,
        frozenRows && frozenColumns ? (react_1.default.createElement("div", { style: {
                position: "absolute",
                height: frozenRowHeight + fillHandleWidth,
                width: frozenColumnWidth + fillHandleWidth,
                left: 0,
                top: 0,
                overflow: "hidden",
                pointerEvents: "none",
            } },
            borderStyleCellsIntersection,
            selectionAreasIntersection,
            activeCellSelectionFrozenIntersection,
            fillhandleComponent)) : null));
    return (react_1.default.createElement("div", { style: {
            position: "relative",
            width: containerWidth,
            userSelect: "none",
        }, className: "rowsncolumns-grid", ref: scrollContainerRef },
        react_1.default.createElement("div", { className: "rowsncolumns-grid-container", tabIndex: 0, ref: containerRef, ...rest },
            react_1.default.createElement(react_konva_1.Stage, { width: containerWidth, height: containerHeight, ref: stageRef, listening: listenToEvents, ...stageProps }, wrapper(stageChildren))),
        selectionChildren,
        showScrollbar ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "rowsncolumns-grid-scrollbar rowsncolumns-grid-scrollbar-y", tabIndex: -1, style: {
                    height: containerHeight,
                    overflow: "scroll",
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: scrollbarSize,
                    willChange: "transform",
                }, onScroll: handleScroll, ref: verticalScrollRef },
                react_1.default.createElement("div", { style: {
                        position: "absolute",
                        height: estimatedTotalHeight,
                        width: 1,
                    } })),
            react_1.default.createElement("div", { className: "rowsncolumns-grid-scrollbar rowsncolumns-grid-scrollbar-x", tabIndex: -1, style: {
                    overflow: "scroll",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: containerWidth,
                    height: scrollbarSize,
                    willChange: "transform",
                }, onScroll: handleScrollLeft, ref: horizontalScrollRef },
                react_1.default.createElement("div", { style: {
                        position: "absolute",
                        width: estimatedTotalWidth,
                        height: 1,
                    } })))) : null));
}));
exports.default = Grid;
//# sourceMappingURL=Grid.js.map