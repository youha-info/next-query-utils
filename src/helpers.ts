/**
 * Get the page number when page size is changed.
 *
 * Proof:
 * First item in the page must still be visible after page size is changed.
 * Index of the first item = 1 + (curPage - 1) * curSize
 * It must equal: (newPage - 1) * newSize + newPos, (0 < newPos <= newSize)
 *                     = (newPage - 1 + a) * newSize, (a = newPos / newsize,  0 < a <= 1)
 * Therefore, newPage = (1 + (curPage - 1) * curSize) / newSize + b
 *   where (b = 1 - a, 0 <= b < 1), and +b means that ceiling function must be applied.
 * Therefore, newPage = Math.ceil((1 + (curPage - 1) * curSize) / newSize)
 *
 * @param curPage Index of current page
 * @param curSize Current page size
 * @param newSize Target page size
 * @returns
 */
export function getNewPageNumberOnPageSizeChange(curPage: number, curSize: number, newSize: number) {
    return Math.ceil((1 + (curPage - 1) * curSize) / newSize);
}
