"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrowKey = exports.castToString = exports.focusableNodeNames = exports.findNextCellInDataRegion = exports.findLastContentfulCell = exports.findNextContentfulCell = exports.clampIndex = exports.isCellWithinBounds = exports.isEqualCells = exports.isNull = exports.autoSizerCanvas = exports.AutoSizerCanvas = exports.canUseDOM = exports.cellRangeToBounds = exports.extendAreaToMergedCells = exports.isAreasEqual = exports.areaInsideArea = exports.areaIntersects = exports.findNextCellWithinBounds = exports.prepareClipboardData = exports.numberToAlphabet = exports.clampCellCoords = exports.newSelectionFromDrag = exports.selectionSpansCells = exports.selectionFromActiveCell = exports.requestTimeout = exports.cancelTimeout = exports.getOffsetForRowAndAlignment = exports.getOffsetForColumnAndAlignment = exports.getOffsetForIndexAndAlignment = exports.rafThrottle = exports.debounce = exports.throttle = exports.cellIdentifier = exports.getEstimatedTotalWidth = exports.getEstimatedTotalHeight = exports.getItemMetadata = exports.getColumnWidth = exports.getRowHeight = exports.getColumnOffset = exports.getRowOffset = exports.itemKey = exports.getBoundedCells = exports.getColumnStopIndexForStartIndex = exports.getColumnStartIndexForOffset = exports.getRowStopIndexForStartIndex = exports.getRowStartIndexForOffset = exports.ItemType = exports.Align = void 0;
const types_1 = require("./types");
var Align;
(function (Align) {
    Align["start"] = "start";
    Align["end"] = "end";
    Align["center"] = "center";
    Align["auto"] = "auto";
    Align["smart"] = "smart";
})(Align = exports.Align || (exports.Align = {}));
var ItemType;
(function (ItemType) {
    ItemType["row"] = "row";
    ItemType["column"] = "column";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
const getRowStartIndexForOffset = ({ rowHeight, columnWidth, rowCount, columnCount, instanceProps, offset, scale, }) => {
    return findNearestItem({
        itemType: ItemType.row,
        rowHeight,
        columnWidth,
        rowCount,
        columnCount,
        instanceProps,
        offset,
        scale,
    });
};
exports.getRowStartIndexForOffset = getRowStartIndexForOffset;
const getRowStopIndexForStartIndex = ({ startIndex, rowCount, rowHeight, columnWidth, scrollTop, containerHeight, instanceProps, scale, }) => {
    const itemMetadata = (0, exports.getItemMetadata)({
        itemType: ItemType.row,
        rowHeight,
        columnWidth,
        index: startIndex,
        instanceProps,
        scale,
    });
    const maxOffset = scrollTop + containerHeight;
    let offset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;
    while (stopIndex < rowCount - 1 && offset < maxOffset) {
        stopIndex++;
        offset += (0, exports.getItemMetadata)({
            itemType: ItemType.row,
            rowHeight,
            columnWidth,
            index: stopIndex,
            instanceProps,
            scale,
        }).size;
    }
    return stopIndex;
};
exports.getRowStopIndexForStartIndex = getRowStopIndexForStartIndex;
const getColumnStartIndexForOffset = ({ rowHeight, columnWidth, rowCount, columnCount, instanceProps, offset, scale, }) => {
    return findNearestItem({
        itemType: ItemType.column,
        rowHeight,
        columnWidth,
        rowCount,
        columnCount,
        instanceProps,
        offset,
        scale,
    });
};
exports.getColumnStartIndexForOffset = getColumnStartIndexForOffset;
const getColumnStopIndexForStartIndex = ({ startIndex, rowHeight, columnWidth, instanceProps, containerWidth, scrollLeft, columnCount, scale, }) => {
    const itemMetadata = (0, exports.getItemMetadata)({
        itemType: ItemType.column,
        index: startIndex,
        rowHeight,
        columnWidth,
        instanceProps,
        scale,
    });
    const maxOffset = scrollLeft + containerWidth;
    let offset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;
    while (stopIndex < columnCount - 1 && offset < maxOffset) {
        stopIndex++;
        offset += (0, exports.getItemMetadata)({
            itemType: ItemType.column,
            rowHeight,
            columnWidth,
            index: stopIndex,
            instanceProps,
            scale,
        }).size;
    }
    return stopIndex;
};
exports.getColumnStopIndexForStartIndex = getColumnStopIndexForStartIndex;
const getBoundedCells = (area) => {
    const cells = new Set();
    if (!area)
        return cells;
    const { top, bottom, left, right } = area;
    for (let i = top; i <= bottom; i++) {
        for (let j = left; j <= right; j++) {
            cells.add((0, exports.cellIdentifier)(i, j));
        }
    }
    return cells;
};
exports.getBoundedCells = getBoundedCells;
const itemKey = ({ rowIndex, columnIndex }) => `${rowIndex}:${columnIndex}`;
exports.itemKey = itemKey;
const getRowOffset = ({ index, rowHeight, columnWidth, instanceProps, scale, }) => {
    return (0, exports.getItemMetadata)({
        itemType: ItemType.row,
        index,
        rowHeight,
        columnWidth,
        instanceProps,
        scale,
    }).offset;
};
exports.getRowOffset = getRowOffset;
const getColumnOffset = ({ index, rowHeight, columnWidth, instanceProps, scale, }) => {
    return (0, exports.getItemMetadata)({
        itemType: ItemType.column,
        index,
        rowHeight,
        columnWidth,
        instanceProps,
        scale,
    }).offset;
};
exports.getColumnOffset = getColumnOffset;
const getRowHeight = (index, instanceProps) => {
    return instanceProps.rowMetadataMap[index].size;
};
exports.getRowHeight = getRowHeight;
const getColumnWidth = (index, instanceProps) => {
    return instanceProps.columnMetadataMap[index].size;
};
exports.getColumnWidth = getColumnWidth;
const getItemMetadata = ({ itemType, index, rowHeight, columnWidth, instanceProps, scale = 2, }) => {
    var _a;
    let itemMetadataMap, itemSize, lastMeasuredIndex, recalcIndices;
    if (itemType === "column") {
        itemMetadataMap = instanceProps.columnMetadataMap;
        itemSize = columnWidth;
        lastMeasuredIndex = instanceProps.lastMeasuredColumnIndex;
        recalcIndices = instanceProps.recalcColumnIndices;
    }
    else {
        itemMetadataMap = instanceProps.rowMetadataMap;
        itemSize = rowHeight;
        lastMeasuredIndex = instanceProps.lastMeasuredRowIndex;
        recalcIndices = instanceProps.recalcRowIndices;
    }
    const recalcWithinBoundsOnly = recalcIndices.length > 0;
    if (index > lastMeasuredIndex) {
        let offset = 0;
        if (lastMeasuredIndex >= 0) {
            const itemMetadata = itemMetadataMap[lastMeasuredIndex];
            offset = itemMetadata.offset + itemMetadata.size;
        }
        for (let i = lastMeasuredIndex + 1; i <= index; i++) {
            // Only recalculates specified columns
            let size = recalcWithinBoundsOnly
                ? recalcIndices.includes(i)
                    ? itemSize(i) * scale
                    : ((_a = itemMetadataMap[i]) === null || _a === void 0 ? void 0 : _a.size) || itemSize(i) * scale
                : itemSize(i) * scale;
            itemMetadataMap[i] = {
                offset,
                size,
            };
            offset += size;
        }
        if (itemType === "column") {
            instanceProps.lastMeasuredColumnIndex = index;
        }
        else {
            instanceProps.lastMeasuredRowIndex = index;
        }
    }
    return itemMetadataMap[index];
};
exports.getItemMetadata = getItemMetadata;
const findNearestItem = ({ itemType, rowHeight, columnWidth, rowCount, columnCount, instanceProps, offset, scale, }) => {
    let itemMetadataMap, lastMeasuredIndex;
    if (itemType === "column") {
        itemMetadataMap = instanceProps.columnMetadataMap;
        lastMeasuredIndex = instanceProps.lastMeasuredColumnIndex;
    }
    else {
        itemMetadataMap = instanceProps.rowMetadataMap;
        lastMeasuredIndex = instanceProps.lastMeasuredRowIndex;
    }
    const lastMeasuredItemOffset = lastMeasuredIndex > 0 ? itemMetadataMap[lastMeasuredIndex].offset : 0;
    if (lastMeasuredItemOffset >= offset) {
        // If we've already measured items within this range just use a binary search as it's faster.
        return findNearestItemBinarySearch({
            itemType,
            rowHeight,
            columnWidth,
            instanceProps,
            high: lastMeasuredIndex,
            low: 0,
            offset,
            scale,
        });
    }
    else {
        // If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
        // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
        // The overall complexity for this approach is O(log n).
        return findNearestItemExponentialSearch({
            itemType,
            rowHeight,
            rowCount,
            columnCount,
            columnWidth,
            instanceProps,
            index: Math.max(0, lastMeasuredIndex),
            offset,
            scale,
        });
    }
};
const findNearestItemBinarySearch = ({ itemType, rowHeight, columnWidth, instanceProps, high, low, offset, scale, }) => {
    while (low <= high) {
        const middle = low + Math.floor((high - low) / 2);
        const currentOffset = (0, exports.getItemMetadata)({
            itemType,
            rowHeight,
            columnWidth,
            index: middle,
            instanceProps,
            scale,
        }).offset;
        if (currentOffset === offset) {
            return middle;
        }
        else if (currentOffset < offset) {
            low = middle + 1;
        }
        else if (currentOffset > offset) {
            high = middle - 1;
        }
    }
    if (low > 0) {
        return low - 1;
    }
    else {
        return 0;
    }
};
const findNearestItemExponentialSearch = ({ itemType, rowHeight, columnWidth, rowCount, columnCount, instanceProps, index, offset, scale, }) => {
    const itemCount = itemType === "column" ? columnCount : rowCount;
    let interval = 1;
    while (index < itemCount &&
        (0, exports.getItemMetadata)({
            itemType,
            rowHeight,
            columnWidth,
            index,
            instanceProps,
            scale,
        }).offset < offset) {
        index += interval;
        interval *= 2;
    }
    return findNearestItemBinarySearch({
        itemType,
        rowHeight,
        columnWidth,
        instanceProps,
        high: Math.min(index, itemCount - 1),
        low: Math.floor(index / 2),
        offset,
        scale,
    });
};
const getEstimatedTotalHeight = (rowCount, instanceProps) => {
    const { estimatedRowHeight } = instanceProps;
    let totalSizeOfMeasuredRows = 0;
    let { lastMeasuredRowIndex, rowMetadataMap } = instanceProps;
    // Edge case check for when the number of items decreases while a scroll is in progress.
    // https://github.com/bvaughn/react-window/pull/138
    if (lastMeasuredRowIndex >= rowCount) {
        lastMeasuredRowIndex = rowCount - 1;
    }
    if (lastMeasuredRowIndex >= 0) {
        const itemMetadata = rowMetadataMap[lastMeasuredRowIndex];
        totalSizeOfMeasuredRows = itemMetadata.offset + itemMetadata.size;
    }
    const numUnmeasuredItems = rowCount - lastMeasuredRowIndex - 1;
    const totalSizeOfUnmeasuredItems = numUnmeasuredItems * estimatedRowHeight;
    return totalSizeOfMeasuredRows + totalSizeOfUnmeasuredItems;
};
exports.getEstimatedTotalHeight = getEstimatedTotalHeight;
const getEstimatedTotalWidth = (columnCount, instanceProps) => {
    const { estimatedColumnWidth } = instanceProps;
    let totalSizeOfMeasuredRows = 0;
    let { lastMeasuredColumnIndex, columnMetadataMap } = instanceProps;
    // Edge case check for when the number of items decreases while a scroll is in progress.
    // https://github.com/bvaughn/react-window/pull/138
    if (lastMeasuredColumnIndex >= columnCount) {
        lastMeasuredColumnIndex = columnCount - 1;
    }
    if (lastMeasuredColumnIndex >= 0) {
        const itemMetadata = columnMetadataMap[lastMeasuredColumnIndex];
        totalSizeOfMeasuredRows = itemMetadata.offset + itemMetadata.size;
    }
    const numUnmeasuredItems = columnCount - lastMeasuredColumnIndex - 1;
    const totalSizeOfUnmeasuredItems = numUnmeasuredItems * estimatedColumnWidth;
    return totalSizeOfMeasuredRows + totalSizeOfUnmeasuredItems;
};
exports.getEstimatedTotalWidth = getEstimatedTotalWidth;
/* Create a stringified cell identifier */
const cellIdentifier = (rowIndex, columnIndex) => `${rowIndex},${columnIndex}`;
exports.cellIdentifier = cellIdentifier;
/**
 * @desc Throttle fn
 * @param func function
 * @param limit Delay in milliseconds
 */
function throttle(func, limit) {
    var lastEventTimestamp = null;
    let callable = (...args) => {
        const now = Date.now();
        if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
            lastEventTimestamp = now;
            func(...args);
        }
    };
    return callable;
}
exports.throttle = throttle;
function debounce(cb, wait = 300) {
    let h = 0;
    let callable = (...args) => {
        clearTimeout(h);
        h = window.setTimeout(() => cb(...args), wait);
    };
    return callable;
}
exports.debounce = debounce;
function rafThrottle(callback) {
    var active = false; // a simple flag
    var evt; // to keep track of the last event
    var handler = function () {
        // fired only when screen has refreshed
        active = false; // release our flag
        callback(evt);
    };
    return function handleEvent(e) {
        // the actual event handler
        evt = e; // save our event at each call
        evt && evt.persist && evt.persist();
        if (!active) {
            // only if we weren't already doing it
            active = true; // raise the flag
            requestAnimationFrame(handler); // wait for next screen refresh
        }
    };
}
exports.rafThrottle = rafThrottle;
const getOffsetForIndexAndAlignment = ({ itemType, containerHeight, containerWidth, rowHeight, columnWidth, columnCount, rowCount, index, align = Align.smart, scrollOffset, instanceProps, scrollbarSize, frozenOffset = 0, scale, estimatedTotalHeight, estimatedTotalWidth, }) => {
    const size = itemType === "column" ? containerWidth : containerHeight;
    const itemMetadata = (0, exports.getItemMetadata)({
        itemType,
        rowHeight,
        columnWidth,
        index,
        instanceProps,
        scale,
    });
    // Get estimated total size after ItemMetadata is computed,
    // To ensure it reflects actual measurements instead of just estimates.
    const estimatedTotalSize = itemType === "column" ? estimatedTotalWidth : estimatedTotalHeight;
    const maxOffset = Math.max(0, Math.min(estimatedTotalSize - size, itemMetadata.offset - frozenOffset));
    const minOffset = Math.max(0, itemMetadata.offset - size + scrollbarSize + itemMetadata.size);
    if (align === Align.smart) {
        if (scrollOffset >= minOffset - size && scrollOffset <= maxOffset + size) {
            align = Align.auto;
        }
        else {
            align = Align.center;
        }
    }
    switch (align) {
        case Align.start:
            return maxOffset;
        case Align.end:
            return minOffset;
        case Align.center:
            return Math.round(minOffset + (maxOffset - minOffset) / 2);
        case Align.auto:
        default:
            if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
                return scrollOffset;
            }
            else if (minOffset > maxOffset) {
                // Because we only take into account the scrollbar size when calculating minOffset
                // this value can be larger than maxOffset when at the end of the list
                return minOffset;
            }
            else if (scrollOffset < minOffset) {
                return minOffset;
            }
            else {
                return maxOffset;
            }
    }
};
exports.getOffsetForIndexAndAlignment = getOffsetForIndexAndAlignment;
const getOffsetForColumnAndAlignment = (props) => {
    return (0, exports.getOffsetForIndexAndAlignment)({
        itemType: ItemType.column,
        ...props,
    });
};
exports.getOffsetForColumnAndAlignment = getOffsetForColumnAndAlignment;
const getOffsetForRowAndAlignment = (props) => {
    return (0, exports.getOffsetForIndexAndAlignment)({
        itemType: ItemType.row,
        ...props,
    });
};
exports.getOffsetForRowAndAlignment = getOffsetForRowAndAlignment;
// Animation frame based implementation of setTimeout.
// Inspired by Joe Lambert, https://gist.github.com/joelambert/1002116#file-requesttimeout-js
const hasNativePerformanceNow = typeof performance === "object" && typeof performance.now === "function";
const now = hasNativePerformanceNow
    ? () => performance.now()
    : () => Date.now();
function cancelTimeout(timeoutID) {
    cancelAnimationFrame(timeoutID.id);
}
exports.cancelTimeout = cancelTimeout;
/**
 * Create a throttler based on RAF
 * @param callback
 * @param delay
 */
function requestTimeout(callback, delay) {
    const start = now();
    function tick() {
        if (now() - start >= delay) {
            callback.call(null);
        }
        else {
            timeoutID.id = requestAnimationFrame(tick);
        }
    }
    const timeoutID = {
        id: requestAnimationFrame(tick),
    };
    return timeoutID;
}
exports.requestTimeout = requestTimeout;
const selectionFromActiveCell = (activeCell) => {
    if (!activeCell)
        return [];
    return [
        {
            bounds: {
                top: activeCell.rowIndex,
                left: activeCell.columnIndex,
                bottom: activeCell.rowIndex,
                right: activeCell.columnIndex,
            },
        },
    ];
};
exports.selectionFromActiveCell = selectionFromActiveCell;
/**
 * Check if a selection are spans multiple cells
 * @param sel
 */
const selectionSpansCells = (sel) => {
    if (!sel)
        return false;
    return sel.bottom !== sel.top || sel.left !== sel.right;
};
exports.selectionSpansCells = selectionSpansCells;
/**
 * When user tries to drag a selection
 * @param initialSelection
 * @param from
 * @param to
 */
const newSelectionFromDrag = (initialSelection, from, to, topBound = 0, leftBound = 0, rowCount, columnCount) => {
    const currentBounds = initialSelection.bounds;
    const top = Math.max(topBound, Math.min(rowCount, to.rowIndex + currentBounds.top - from.rowIndex));
    const left = Math.max(leftBound, Math.min(columnCount, to.columnIndex + currentBounds.left - from.columnIndex));
    return {
        bounds: {
            top,
            left,
            bottom: top + (currentBounds.bottom - currentBounds.top),
            right: left + (currentBounds.right - currentBounds.left),
        },
    };
};
exports.newSelectionFromDrag = newSelectionFromDrag;
/**
 * Clamp cell coordinates to be inside activeCell and selection
 * @param coords
 * @param activeCell
 * @param selection
 */
const clampCellCoords = (coords, activeCell, selection) => {
    if (activeCell) {
        coords.rowIndex = Math.max(activeCell.rowIndex, coords.rowIndex);
        coords.columnIndex = Math.min(activeCell.columnIndex, coords.columnIndex);
    }
    if (selection) {
        coords.rowIndex = Math.min(selection.bounds.bottom, Math.max(selection.bounds.top, coords.rowIndex));
        coords.columnIndex = Math.min(selection.bounds.right, Math.max(selection.bounds.left, coords.columnIndex));
    }
    return coords;
};
exports.clampCellCoords = clampCellCoords;
/**
 * Converts a number to alphabet
 * @param i
 */
const numberToAlphabet = (i) => {
    return ((i >= 26 ? (0, exports.numberToAlphabet)(((i / 26) >> 0) - 1) : "") +
        "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]).toUpperCase();
};
exports.numberToAlphabet = numberToAlphabet;
/**
 * Convert selections to html and csv data
 * @param rows
 */
const prepareClipboardData = (rows) => {
    const html = ["<table>"];
    const csv = [];
    const sanitizeCell = (value) => {
        if ((0, exports.isNull)(value))
            return "";
        return value;
    };
    rows.forEach((row) => {
        html.push("<tr>");
        const csvRow = [];
        row.forEach((cell) => {
            var _a;
            html.push(`<td>${sanitizeCell(cell)}</td>`);
            csvRow.push(`${(_a = (0, exports.castToString)(cell)) === null || _a === void 0 ? void 0 : _a.replace(/"/g, '""')}`);
        });
        csv.push(csvRow.join(","));
        html.push("</tr>");
    });
    html.push("</table>");
    return [html.join(""), csv.join("\n")];
};
exports.prepareClipboardData = prepareClipboardData;
/**
 * Cycles active cell within selecton bounds
 * @param activeCellBounds
 * @param selectionBounds
 * @param direction
 */
const findNextCellWithinBounds = (activeCellBounds, selectionBounds, direction = types_1.Direction.Right) => {
    const intersects = (0, exports.areaIntersects)(activeCellBounds, selectionBounds);
    if (!intersects)
        return null;
    let rowIndex, columnIndex;
    let nextActiveCell = null;
    if (direction === types_1.Direction.Right) {
        rowIndex = activeCellBounds.top;
        columnIndex = activeCellBounds.left + 1;
        if (columnIndex > selectionBounds.right) {
            rowIndex = rowIndex + 1;
            columnIndex = selectionBounds.left;
            if (rowIndex > selectionBounds.bottom) {
                rowIndex = selectionBounds.top;
            }
        }
        nextActiveCell = { rowIndex, columnIndex };
    }
    if (direction === types_1.Direction.Left) {
        rowIndex = activeCellBounds.bottom;
        columnIndex = activeCellBounds.left - 1;
        if (columnIndex < selectionBounds.left) {
            rowIndex = rowIndex - 1;
            columnIndex = selectionBounds.right;
            if (rowIndex < selectionBounds.top) {
                rowIndex = selectionBounds.bottom;
            }
        }
        nextActiveCell = { rowIndex, columnIndex };
    }
    if (direction === types_1.Direction.Down) {
        rowIndex = activeCellBounds.bottom + 1;
        columnIndex = activeCellBounds.left;
        if (rowIndex > selectionBounds.bottom) {
            columnIndex = activeCellBounds.left + 1;
            rowIndex = selectionBounds.top;
            if (columnIndex > selectionBounds.right) {
                columnIndex = selectionBounds.left;
            }
        }
        nextActiveCell = { rowIndex, columnIndex };
    }
    if (direction === types_1.Direction.Up) {
        rowIndex = activeCellBounds.top - 1;
        columnIndex = activeCellBounds.left;
        if (rowIndex < selectionBounds.top) {
            columnIndex = activeCellBounds.left - 1;
            rowIndex = selectionBounds.bottom;
            if (columnIndex < selectionBounds.left) {
                columnIndex = selectionBounds.right;
            }
        }
        nextActiveCell = { rowIndex, columnIndex };
    }
    return nextActiveCell;
};
exports.findNextCellWithinBounds = findNextCellWithinBounds;
/**
 * Check if 2 areas overlap
 * @param area1
 * @param area2
 */
const areaIntersects = (area1, area2) => {
    if (area1.left > area2.right || area2.left > area1.right) {
        return false;
    }
    if (area1.top > area2.bottom || area2.top > area1.bottom) {
        return false;
    }
    return true;
};
exports.areaIntersects = areaIntersects;
/**
 * Check if area is inside another area
 * @param needle
 * @param haystack
 */
const areaInsideArea = (needle, haystack) => {
    return (needle.top >= haystack.top &&
        needle.bottom <= haystack.bottom &&
        needle.left >= haystack.left &&
        needle.right <= haystack.right);
};
exports.areaInsideArea = areaInsideArea;
/**
 * Check if two areas are equal
 * @param area1
 * @param area2
 */
const isAreasEqual = (area1, area2) => {
    if (area1 === void 0 || area2 === void 0) {
        return false;
    }
    return (area1.bottom === area2.bottom &&
        area1.top === area2.top &&
        area1.left === area2.left &&
        area1.right === area2.right);
};
exports.isAreasEqual = isAreasEqual;
/**
 * Get maximum bound of an area, caters to merged cells
 * @param area
 * @param boundGetter
 */
const extendAreaToMergedCells = (_area, mergedCells) => {
    const area = { ..._area };
    for (const bounds of mergedCells) {
        if ((0, exports.areaIntersects)(area, bounds)) {
            area.top = Math.min(area.top, bounds.top);
            area.bottom = Math.max(area.bottom, bounds.bottom);
            area.right = Math.max(area.right, bounds.right);
            area.left = Math.min(area.left, bounds.left);
        }
    }
    return area;
};
exports.extendAreaToMergedCells = extendAreaToMergedCells;
/**
 * Convert 2 cells to bounds
 * @param start
 * @param end
 * @returns
 *
 * 2 loops O(n)
 */
const cellRangeToBounds = (start, end, spanMerges = true, getCellBounds) => {
    let top = Math.min(start.rowIndex, end.rowIndex);
    let bottom = Math.max(start.rowIndex, end.rowIndex);
    let left = Math.min(start.columnIndex, end.columnIndex);
    let right = Math.max(start.columnIndex, end.columnIndex);
    /**
     * The idea is that
     * We do 2 loops >
     * Left to Right and then top to bottom
     *  => Find top cell and bottom cell and check
     * if there are any merged cells at the edge
     * Then keep extending our top and bottom bounds accordingly
     *
     * Same goes for Top to bottom
     *  => Find left most and right most cells
     */
    if (spanMerges) {
        for (let columnIndex = left; columnIndex <= right; columnIndex++) {
            const topCell = getCellBounds({ rowIndex: top, columnIndex });
            const bottomCell = getCellBounds({ rowIndex: bottom, columnIndex });
            bottom = Math.max(topCell.bottom, bottomCell.bottom, bottom);
            top = Math.min(topCell.top, bottomCell.top, top);
        }
        for (let rowIndex = top; rowIndex <= bottom; rowIndex++) {
            const topCell = getCellBounds({ rowIndex, columnIndex: left });
            const bottomCell = getCellBounds({ rowIndex, columnIndex: right });
            right = Math.max(topCell.right, bottomCell.right, right);
            left = Math.min(topCell.left, bottomCell.left, left);
        }
    }
    return {
        top,
        left,
        right,
        bottom,
    };
};
exports.cellRangeToBounds = cellRangeToBounds;
/**
 * Check if its being rendered in Browser or SSR
 */
exports.canUseDOM = !!(typeof window !== "undefined" &&
    window.document &&
    window.document.createElement);
const AutoSizerCanvas = (defaults = {}) => {
    const { fontFamily = "Arial", fontSize = 12, fontWeight = "", fontStyle = "", lineHeight = 16, scale = 1, } = defaults;
    var o = {
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        lineHeight,
        scale,
    };
    const canvas = exports.canUseDOM && document.createElement("canvas");
    const context = canvas ? canvas.getContext("2d") : null;
    const setFont = (options = {}) => {
        var _a;
        for (const key in options) {
            o[key] = (_a = options[key]) !== null && _a !== void 0 ? _a : o[key];
        }
        if (context) {
            context.font = `${o.fontStyle} ${o.fontWeight} ${o.fontSize * o.scale}px ${o.fontFamily}`;
        }
    };
    const getWidthOfLongestText = (text) => {
        var _a;
        let width = 0;
        let height = 0;
        if (text === void 0)
            return { width, height };
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineWidth = (_a = context === null || context === void 0 ? void 0 : context.measureText(line).width) !== null && _a !== void 0 ? _a : 0;
            width = Math.max(width, lineWidth);
            height += o.fontSize * 1.2 * o.scale;
        }
        return { width: Math.ceil(width), height: Math.ceil(height) };
    };
    const measureText = (text) => getWidthOfLongestText((0, exports.castToString)(text));
    const reset = () => setFont(defaults);
    /* Set font in constructor */
    setFont(o);
    return {
        context,
        measureText,
        setFont,
        reset,
    };
};
exports.AutoSizerCanvas = AutoSizerCanvas;
/* Export a singleton */
exports.autoSizerCanvas = (0, exports.AutoSizerCanvas)();
/* Check if a value is null */
const isNull = (value) => value === void 0 || value === null || value === "";
exports.isNull = isNull;
const isEqualCells = (a, b) => {
    if ((0, exports.isNull)(a) || (0, exports.isNull)(b) || a === null || b === null)
        return false;
    return a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex;
};
exports.isEqualCells = isEqualCells;
/**
 * Simple utility function to check if cell is within bounds
 * @param cell
 * @param bounds
 */
const isCellWithinBounds = (cell, bounds) => {
    if (cell.rowIndex < bounds.top || cell.rowIndex > bounds.bottom) {
        return false;
    }
    if (cell.columnIndex < bounds.left || cell.columnIndex > bounds.right) {
        return false;
    }
    return true;
};
exports.isCellWithinBounds = isCellWithinBounds;
const clampIndex = (index, isHidden, direction) => {
    switch (direction) {
        case types_1.Direction.Right:
        case types_1.Direction.Down:
            let hidden = isHidden === null || isHidden === void 0 ? void 0 : isHidden(index);
            while (hidden === true) {
                hidden = isHidden === null || isHidden === void 0 ? void 0 : isHidden(++index);
            }
            break;
        case types_1.Direction.Left:
        case types_1.Direction.Up: {
            let hidden = isHidden === null || isHidden === void 0 ? void 0 : isHidden(index);
            while (hidden === true) {
                hidden = isHidden === null || isHidden === void 0 ? void 0 : isHidden(--index);
            }
            break;
        }
    }
    return index;
};
exports.clampIndex = clampIndex;
/**
 * Find a cell with content if the current cell is out of the current dataregion
 * [
 *  1, 2, 3,
 *  x, x, x
 *  7, 8, 9
 * ]
 * activeCel = 2
 * direction = Down
 * New Cell = 8
 *
 * @param activeCell
 * @param getValue
 * @param isHidden
 * @param direction
 * @param limit
 */
const findNextContentfulCell = (activeCell, getValue, isHidden, direction, limit) => {
    var { rowIndex, columnIndex } = activeCell;
    switch (direction) {
        case types_1.Direction.Down: {
            rowIndex = (0, exports.clampIndex)(Math.min(rowIndex + 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while ((0, exports.isNull)(value) && rowIndex < limit) {
                rowIndex = (0, exports.clampIndex)(Math.min(++rowIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return { rowIndex, columnIndex };
        }
        case types_1.Direction.Up: {
            rowIndex = (0, exports.clampIndex)(Math.max(rowIndex - 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while ((0, exports.isNull)(value) && rowIndex > limit) {
                rowIndex = (0, exports.clampIndex)(Math.max(--rowIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return { rowIndex, columnIndex };
        }
        case types_1.Direction.Right: {
            columnIndex = (0, exports.clampIndex)(Math.min(columnIndex + 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while ((0, exports.isNull)(value) && columnIndex < limit) {
                columnIndex = (0, exports.clampIndex)(Math.min(++columnIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return { rowIndex, columnIndex };
        }
        case types_1.Direction.Left: {
            columnIndex = (0, exports.clampIndex)(Math.max(columnIndex - 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while ((0, exports.isNull)(value) && columnIndex > limit) {
                columnIndex = (0, exports.clampIndex)(Math.max(--columnIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return { rowIndex, columnIndex };
        }
        default:
            return activeCell;
    }
};
exports.findNextContentfulCell = findNextContentfulCell;
/**
 * Find the next cell
 * @param activeCell
 * @param getValue
 * @param isHidden
 * @param direction
 * @param limit
 */
const findLastContentfulCell = (activeCell, getValue, isHidden, direction, limit) => {
    var { rowIndex, columnIndex } = activeCell;
    switch (direction) {
        case types_1.Direction.Down: {
            rowIndex = (0, exports.clampIndex)(Math.min(rowIndex + 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while (!(0, exports.isNull)(value) && rowIndex < limit) {
                rowIndex = (0, exports.clampIndex)(Math.min(++rowIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return {
                columnIndex,
                rowIndex: (0, exports.isNull)(getValue({ columnIndex, rowIndex }))
                    ? rowIndex - 1
                    : rowIndex,
            };
        }
        case types_1.Direction.Up: {
            rowIndex = (0, exports.clampIndex)(Math.max(rowIndex - 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while (!(0, exports.isNull)(value) && rowIndex > limit) {
                rowIndex = (0, exports.clampIndex)(Math.max(--rowIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return {
                columnIndex,
                rowIndex: (0, exports.isNull)(getValue({ columnIndex, rowIndex }))
                    ? rowIndex + 1
                    : rowIndex,
            };
        }
        case types_1.Direction.Right: {
            columnIndex = (0, exports.clampIndex)(Math.min(columnIndex + 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while (!(0, exports.isNull)(value) && columnIndex < limit) {
                columnIndex = (0, exports.clampIndex)(Math.min(++columnIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return {
                rowIndex,
                columnIndex: (0, exports.isNull)(getValue({ columnIndex, rowIndex }))
                    ? columnIndex - 1
                    : columnIndex,
            };
        }
        case types_1.Direction.Left: {
            columnIndex = (0, exports.clampIndex)(Math.max(columnIndex - 1, limit), isHidden, direction);
            let value = getValue({ rowIndex, columnIndex });
            while (!(0, exports.isNull)(value) && columnIndex > limit) {
                columnIndex = (0, exports.clampIndex)(Math.max(--columnIndex, limit), isHidden, direction);
                value = getValue({ rowIndex, columnIndex });
            }
            return {
                rowIndex,
                columnIndex: (0, exports.isNull)(getValue({ columnIndex, rowIndex }))
                    ? columnIndex + 1
                    : columnIndex,
            };
        }
        default:
            return activeCell;
    }
};
exports.findLastContentfulCell = findLastContentfulCell;
/**
 * Ex
 */
const findNextCellInDataRegion = (activeCell, getValue, isHidden, direction, limit) => {
    var { rowIndex, columnIndex } = activeCell;
    const isCurrentCellEmpty = (0, exports.isNull)(getValue(activeCell));
    const didWeReachTheEdge = (cur, next) => {
        return (cur && next) || (cur && !next) || (!cur && next);
    };
    switch (direction) {
        case types_1.Direction.Down: {
            const nextCellValue = getValue({ rowIndex: rowIndex + 1, columnIndex });
            const isNextCellEmpty = (0, exports.isNull)(nextCellValue);
            const isEdge = didWeReachTheEdge(isCurrentCellEmpty, isNextCellEmpty);
            const nextCell = isEdge
                ? (0, exports.findNextContentfulCell)(activeCell, getValue, isHidden, direction, limit)
                : (0, exports.findLastContentfulCell)(activeCell, getValue, isHidden, direction, limit);
            return nextCell === null || nextCell === void 0 ? void 0 : nextCell.rowIndex;
        }
        case types_1.Direction.Up: {
            const nextCellValue = getValue({ rowIndex: rowIndex - 1, columnIndex });
            const isNextCellEmpty = (0, exports.isNull)(nextCellValue);
            const isEdge = didWeReachTheEdge(isCurrentCellEmpty, isNextCellEmpty);
            const nextCell = isEdge
                ? (0, exports.findNextContentfulCell)(activeCell, getValue, isHidden, direction, limit)
                : (0, exports.findLastContentfulCell)(activeCell, getValue, isHidden, direction, limit);
            return nextCell === null || nextCell === void 0 ? void 0 : nextCell.rowIndex;
        }
        case types_1.Direction.Right: {
            const nextCellValue = getValue({
                rowIndex,
                columnIndex: columnIndex + 1,
            });
            const isNextCellEmpty = (0, exports.isNull)(nextCellValue);
            const isEdge = didWeReachTheEdge(isCurrentCellEmpty, isNextCellEmpty);
            const nextCell = isEdge
                ? (0, exports.findNextContentfulCell)(activeCell, getValue, isHidden, direction, limit)
                : (0, exports.findLastContentfulCell)(activeCell, getValue, isHidden, direction, limit);
            return nextCell === null || nextCell === void 0 ? void 0 : nextCell.columnIndex;
        }
        case types_1.Direction.Left: {
            const nextCellValue = getValue({
                rowIndex,
                columnIndex: columnIndex - 1,
            });
            const isNextCellEmpty = (0, exports.isNull)(nextCellValue);
            const isEdge = didWeReachTheEdge(isCurrentCellEmpty, isNextCellEmpty);
            const nextCell = isEdge
                ? (0, exports.findNextContentfulCell)(activeCell, getValue, isHidden, direction, limit)
                : (0, exports.findLastContentfulCell)(activeCell, getValue, isHidden, direction, limit);
            return nextCell === null || nextCell === void 0 ? void 0 : nextCell.columnIndex;
        }
    }
};
exports.findNextCellInDataRegion = findNextCellInDataRegion;
/* Focusable node names */
exports.focusableNodeNames = new Set(["INPUT", "TEXTAREA", "SELECT"]);
/**
 * Converts a value to string
 * @param value
 */
const castToString = (value) => {
    if (value === null || value === void 0)
        return void 0;
    return typeof value !== "string" ? "" + value : value;
};
exports.castToString = castToString;
const isArrowKey = (keyCode) => {
    return [types_1.KeyCodes.Up, types_1.KeyCodes.Down, types_1.KeyCodes.Left, types_1.KeyCodes.Right].includes(keyCode);
};
exports.isArrowKey = isArrowKey;
//# sourceMappingURL=helpers.js.map