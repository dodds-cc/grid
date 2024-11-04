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
/**
 * Pagination hook
 * @param props
 */
const usePagination = (props) => {
    const { initialPage = 1, pageSize = 10, total = 0, onChange, component = PaginationComponent, } = props !== null && props !== void 0 ? props : {};
    const [currentPage, setCurrentPage] = (0, react_1.useState)(initialPage);
    const totalPages = Math.ceil(total / pageSize);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToFirst = () => setCurrentPage(1);
    const goToLast = () => setCurrentPage(totalPages);
    const goToPage = (page) => setCurrentPage(page);
    (0, react_1.useEffect)(() => {
        onChange && onChange(currentPage);
    }, [currentPage]);
    const pageProps = {
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        goToFirst,
        goToLast,
        goToPage,
        pageSize,
    };
    const paginationComponent = react_1.default.createElement(component, pageProps);
    return {
        paginationComponent,
        ...pageProps,
    };
};
const PaginationComponent = ({ currentPage, goToFirst, goToLast, goToPage, totalPages, nextPage, prevPage, }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        const isActive = currentPage === i;
        pages.push(react_1.default.createElement("button", { onClick: () => goToPage(i) }, isActive ? react_1.default.createElement("strong", null, i) : i));
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("button", { onClick: goToFirst, disabled: currentPage === 1 }, "First page"),
        react_1.default.createElement("button", { onClick: prevPage, disabled: currentPage === 1 }, "Prev page"),
        pages,
        react_1.default.createElement("button", { onClick: nextPage, disabled: currentPage === totalPages }, "Next page"),
        react_1.default.createElement("button", { onClick: goToLast, disabled: currentPage === totalPages }, "Last page")));
};
exports.default = usePagination;
//# sourceMappingURL=usePagination.js.map