import React from "react";
export interface PaginationProps {
    /**
     * No of items in each page
     */
    pageSize: number;
    /**
     * Initial page index. Start from 1
     */
    initialPage?: number;
    /**
     * Total number of rows
     */
    total: number;
    /**
     * Callback when page is changed
     */
    onChange?: (page: number) => void;
    /**
     * Pagination Component
     */
    component?: React.FC<PaginationComponentProps> | React.ComponentClass<PaginationComponentProps>;
}
export type PaginationComponentProps = Omit<PaginationResults, "paginationComponent">;
export interface PaginationResults {
    /**
     * Current page number
     */
    currentPage: number;
    /**
     * Total pages
     */
    totalPages: number;
    /**
     * No of items in each page
     */
    pageSize: number;
    /**
     * Pagination component
     */
    paginationComponent: React.ReactNode;
    /**
     * Navigate to next page
     */
    nextPage: () => void;
    /**
     * Navigate to prev page
     */
    prevPage: () => void;
    /**
     * Navigate to first page
     */
    goToFirst: () => void;
    /**
     * Navigate to last page
     */
    goToLast: () => void;
    /**
     * Navigate to specific page
     */
    goToPage: (page: number) => void;
}
/**
 * Pagination hook
 * @param props
 */
declare const usePagination: (props: PaginationProps) => PaginationResults;
export default usePagination;
