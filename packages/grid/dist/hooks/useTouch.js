"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
// @ts-ignore
const scroller_1 = require("scroller");
const helpers_1 = require("../helpers");
/**
 * Enable touch interactions
 * Supports
 * 1. Scrolling
 * 2. Cell selection
 */
const useTouch = ({ gridRef }) => {
    const scrollerRef = (0, react_1.useRef)(null);
    const isTouchDevice = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e, _f, _g;
        isTouchDevice.current = helpers_1.canUseDOM && "ontouchstart" in window;
        /* Update dimension */
        if (isTouchDevice.current) {
            const options = {
                scrollingX: true,
                scrollingY: true,
                decelerationRate: 0.95,
                penetrationAcceleration: 0.08,
            };
            /* Add listeners */
            (_b = (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.addEventListener("touchstart", handleTouchStart);
            (_d = (_c = gridRef.current) === null || _c === void 0 ? void 0 : _c.container) === null || _d === void 0 ? void 0 : _d.addEventListener("touchend", handleTouchEnd);
            (_f = (_e = gridRef.current) === null || _e === void 0 ? void 0 : _e.container) === null || _f === void 0 ? void 0 : _f.addEventListener("touchmove", handleTouchMove);
            /* Add scroller */
            scrollerRef.current = new scroller_1.Scroller(handleTouchScroll, options);
            const dims = (_g = gridRef.current) === null || _g === void 0 ? void 0 : _g.getDimensions();
            /* Update dimensions */
            if (dims)
                updateScrollDimensions(dims);
        }
    }, []);
    /* Scroll to x, y coordinate */
    const scrollTo = (0, react_1.useCallback)(({ scrollLeft, scrollTop }) => {
        if (scrollerRef.current)
            scrollerRef.current.scrollTo(scrollLeft, scrollTop);
    }, []);
    /* Scrolls to top if mobile */
    const scrollToTop = (0, react_1.useCallback)(() => {
        if (scrollerRef.current)
            scrollerRef.current.scrollTo(0, 0);
    }, []);
    const updateScrollDimensions = (0, react_1.useCallback)(({ containerWidth, containerHeight, estimatedTotalWidth, estimatedTotalHeight, }) => {
        scrollerRef.current.setDimensions(containerWidth, containerHeight, estimatedTotalWidth, estimatedTotalHeight);
    }, []);
    const handleTouchScroll = (0, react_1.useCallback)((scrollLeft, scrollTop) => {
        var _a;
        (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ scrollTop, scrollLeft });
    }, []);
    const handleTouchStart = (0, react_1.useCallback)((e) => {
        scrollerRef.current.doTouchStart(e.touches, e.timeStamp);
    }, []);
    const handleTouchMove = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        scrollerRef.current.doTouchMove(e.touches, e.timeStamp);
    }, []);
    const handleTouchEnd = (0, react_1.useCallback)((e) => {
        scrollerRef.current.doTouchEnd(e.timeStamp);
    }, []);
    return {
        isTouchDevice: isTouchDevice.current,
        scrollTo,
        scrollToTop,
    };
};
exports.default = useTouch;
//# sourceMappingURL=useTouch.js.map