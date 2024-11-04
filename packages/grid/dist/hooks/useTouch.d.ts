import React from "react";
import { GridRef, ScrollCoords } from "../Grid";
export interface TouchProps {
    /**
     * Grid reference to access grid methods
     */
    gridRef: React.MutableRefObject<GridRef | null>;
}
export interface TouchResults {
    isTouchDevice: boolean;
    scrollTo: (scrollState: ScrollCoords) => void;
    scrollToTop: () => void;
}
/**
 * Enable touch interactions
 * Supports
 * 1. Scrolling
 * 2. Cell selection
 */
declare const useTouch: ({ gridRef }: TouchProps) => TouchResults;
export default useTouch;
