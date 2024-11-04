"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const helpers_1 = require("./../helpers");
const types_1 = require("../types");
const defaultGetText = (config) => config.text;
/**
 * Copy paste hook
 * Usage
 *
 * useCopyPaste ({
 *  onPaste: (text) => {
 *  }
 * })
 */
const useCopyPaste = ({ selections = [], activeCell = null, getValue, gridRef, onPaste, onCut, onCopy, getText = defaultGetText, }) => {
    const selectionRef = (0, react_1.useRef)({ selections, activeCell, getValue });
    const cutSelections = (0, react_1.useRef)();
    /* Keep selections and activeCell upto date */
    (0, react_1.useEffect)(() => {
        selectionRef.current = { selections, activeCell, getValue };
    }, [selections, activeCell, getValue]);
    const currentSelections = () => {
        const sel = selectionRef.current.selections.length
            ? selectionRef.current.selections
            : (0, helpers_1.selectionFromActiveCell)(selectionRef.current.activeCell);
        return sel[sel.length - 1];
    };
    (0, react_1.useEffect)(() => {
        if (!gridRef.current)
            return;
        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);
        document.addEventListener("cut", handleCut);
        return () => {
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("cut", handleCut);
        };
    }, []);
    const handleCut = (0, react_1.useCallback)(() => {
        var _a;
        if (document.activeElement !== ((_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.container)) {
            return;
        }
        cutSelections.current = currentSelections();
        handleProgramaticCopy();
    }, []);
    const handleCopy = (0, react_1.useCallback)((e) => {
        var _a, _b, _c, _d, _e;
        if (document.activeElement !== ((_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.container)) {
            return;
        }
        /* Only copy the last selection */
        const selection = currentSelections();
        const { bounds } = selection;
        const { top, left, right, bottom } = bounds;
        const rows = [];
        const cells = [];
        for (let i = top; i <= bottom; i++) {
            const row = [];
            const cell = [];
            for (let j = left; j <= right; j++) {
                const coords = {
                    rowIndex: i,
                    columnIndex: j,
                };
                const config = {
                    text: selectionRef.current.getValue(coords),
                    sourceCell: coords,
                };
                const value = getText(config);
                cell.push(config);
                row.push(value);
            }
            rows.push(row);
            cells.push(cell);
        }
        const [html, csv] = (0, helpers_1.prepareClipboardData)(rows);
        (_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.setData(types_1.MimeType.html, html);
        (_c = e.clipboardData) === null || _c === void 0 ? void 0 : _c.setData(types_1.MimeType.plain, csv);
        (_d = e.clipboardData) === null || _d === void 0 ? void 0 : _d.setData(types_1.MimeType.csv, csv);
        (_e = e.clipboardData) === null || _e === void 0 ? void 0 : _e.setData(types_1.MimeType.json, JSON.stringify(cells));
        e.preventDefault();
        onCopy === null || onCopy === void 0 ? void 0 : onCopy([selection]);
    }, [currentSelections]);
    const handlePaste = (e) => {
        var _a, _b, _c, _d;
        if (document.activeElement !== ((_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.container)) {
            return;
        }
        const items = (_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.items;
        if (!items)
            return;
        const mimeTypes = [
            types_1.MimeType.json,
            types_1.MimeType.html,
            types_1.MimeType.csv,
            types_1.MimeType.plain,
        ];
        let type;
        let value;
        let plainTextValue = (_c = e.clipboardData) === null || _c === void 0 ? void 0 : _c.getData(types_1.MimeType.plain);
        for (type of mimeTypes) {
            value = (_d = e.clipboardData) === null || _d === void 0 ? void 0 : _d.getData(type);
            if (value)
                break;
        }
        if (!type || !value) {
            console.warn("No clipboard data to paste");
            return;
        }
        let rows = [];
        if (/^text\/html/.test(type)) {
            const domparser = new DOMParser();
            const doc = domparser.parseFromString(value, type);
            const supportedNodes = "table, p, h1, h2, h3, h4, h5, h6";
            let nodes = doc.querySelectorAll(supportedNodes);
            if (nodes.length === 0) {
                rows.push([plainTextValue]);
            }
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.nodeName === "TABLE") {
                    const tableRows = node.querySelectorAll("tr");
                    for (let i = 0; i < tableRows.length; i++) {
                        const tableRow = tableRows[i];
                        const row = [];
                        const cells = tableRow.querySelectorAll("td");
                        for (let j = 0; j < cells.length; j++) {
                            const cell = cells[j];
                            row.push(cell.textContent);
                        }
                        rows.push(row);
                    }
                }
                else {
                    // Single nodes
                    rows.push([node.textContent]);
                }
            }
        }
        else if (type === types_1.MimeType.json) {
            rows = JSON.parse(value);
        }
        else if (type === types_1.MimeType.plain) {
            rows = [[value]];
        }
        else {
            const values = value.split("\n");
            for (const val of values) {
                const row = [];
                for (const cell of val.split(",")) {
                    row.push(cell.replace(/^\"|\"$/gi, ""));
                }
                rows.push(row);
            }
        }
        onPaste &&
            onPaste(rows, selectionRef.current.activeCell, selectionRef.current.selections, cutSelections.current);
        cutSelections.current = undefined;
    };
    /**
     * User is trying to copy from outisde the app
     */
    const handleProgramaticCopy = (0, react_1.useCallback)(() => {
        if (!gridRef.current)
            return;
        gridRef.current.focus();
        document.execCommand("copy");
    }, []);
    /**
     * User is trying to paste from outisde the app
     */
    const handleProgramaticPaste = (0, react_1.useCallback)(async () => {
        if (!gridRef.current)
            return;
        gridRef.current.focus();
        const text = await navigator.clipboard.readText();
        const clipboardData = new DataTransfer();
        clipboardData.setData(types_1.MimeType.plain, text);
        const event = new ClipboardEvent("paste", { clipboardData });
        handlePaste(event);
    }, []);
    return {
        copy: handleProgramaticCopy,
        paste: handleProgramaticPaste,
        cut: handleCut,
    };
};
exports.default = useCopyPaste;
//# sourceMappingURL=useCopyPaste.js.map