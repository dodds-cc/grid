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
/* Default filter component */
const getDefaultFilerComponent = (cell) => null;
/**
 * Use filter hook
 * @param param0
 */
const useFilter = ({ getFilterComponent = getDefaultFilerComponent, gridRef, width = 220, offset = 20, getValue, frozenRows = 0, frozenColumns = 0, }) => {
    const [filterCell, setFilterCell] = (0, react_1.useState)(null);
    const [isFilterVisible, setIsFilterVisible] = (0, react_1.useState)(false);
    const [currentFilter, setCurrentFilter] = (0, react_1.useState)(null);
    const [position, setPosition] = (0, react_1.useState)({
        x: 0,
        y: 0,
    });
    const FilterComponent = (0, react_1.useMemo)(() => {
        return getFilterComponent(filterCell);
    }, [filterCell]);
    /**
     * Show filter panel
     */
    const handleShowFilter = (0, react_1.useCallback)((coords, index, filterView, filter) => {
        if (!gridRef.current)
            return;
        /* Get actual coords for merged cells */
        coords = gridRef.current.getActualCellCoords(coords);
        /* Get scroll position */
        const scrollPosition = gridRef.current.getScrollPosition();
        /* Get cell position */
        const pos = gridRef.current.getCellOffsetFromCoords(coords);
        /* Check if its frozen */
        const isFrozenColumn = coords.columnIndex < frozenColumns;
        const isFrozenRow = coords.rowIndex < frozenRows;
        /* Set cell position */
        setPosition(() => {
            const left = pos.x;
            const top = pos.y;
            const cellWidth = pos.width;
            return {
                x: left +
                    cellWidth -
                    (isFrozenColumn ? 0 : scrollPosition.scrollLeft) <
                    width
                    ? left +
                        cellWidth -
                        offset -
                        (isFrozenColumn ? 0 : scrollPosition.scrollLeft)
                    : left +
                        cellWidth -
                        (isFrozenColumn ? 0 : scrollPosition.scrollLeft) -
                        width,
                y: top - (isFrozenRow ? 0 : scrollPosition.scrollTop) + offset,
            };
        });
        /* Set filter cell */
        setFilterCell(coords);
        /* set current filter */
        setCurrentFilter({ filter, filterView, index });
        /* Show filter */
        showFilter();
    }, [frozenRows, frozenColumns]);
    const hideFilter = (0, react_1.useCallback)(() => {
        setIsFilterVisible(false);
    }, []);
    const showFilter = (0, react_1.useCallback)(() => {
        setIsFilterVisible(true);
    }, []);
    const values = (0, react_1.useMemo)(() => {
        if (!filterCell || !currentFilter)
            return [];
        const { filterView } = currentFilter;
        const { columnIndex } = filterCell;
        const { bounds } = filterView;
        const filterValues = new Set();
        for (let i = bounds.top + 1; i <= bounds.bottom; i++) {
            const cell = { rowIndex: i, columnIndex };
            const text = getValue(cell);
            const value = (0, helpers_1.isNull)(text) ? "" : text;
            filterValues.add(value);
        }
        return Array.from(filterValues);
    }, [filterCell, currentFilter]);
    const filterComponent = isFilterVisible && FilterComponent ? (react_1.default.createElement(FilterComponent, { position: position, width: width, values: values, index: currentFilter === null || currentFilter === void 0 ? void 0 : currentFilter.index, filterView: currentFilter === null || currentFilter === void 0 ? void 0 : currentFilter.filterView, filter: currentFilter === null || currentFilter === void 0 ? void 0 : currentFilter.filter, columnIndex: filterCell === null || filterCell === void 0 ? void 0 : filterCell.columnIndex, rowIndex: filterCell === null || filterCell === void 0 ? void 0 : filterCell.rowIndex, onRequestClose: hideFilter, onRequestShow: handleShowFilter })) : null;
    return {
        filterComponent,
        showFilter: handleShowFilter,
        hideFilter,
    };
};
exports.default = useFilter;
//# sourceMappingURL=useFilter.js.map