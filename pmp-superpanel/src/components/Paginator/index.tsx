import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type PaginatorProps = {
  currentPage: number; // 0-based
  pageSize?: number; // items per page
  totalPages: number; // total items (if you already pass page-count, just set pageSize=1)
  onPageChange: (pageNumber: number) => void; // 0-based
  showPreviousNext: boolean;
  siblingCount?: number; // pages around current
  boundaryCount?: number; // pages at start & end
};

const DOTS = 'DOTS';

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/** build pages like: 1 2 … 3 4 5 6 … 10 11 */
function getPaginationRange(
  total: number,
  current: number, // 1-based
  siblingCount: number,
  boundaryCount: number
): Array<number | typeof DOTS> {
  // show all pages when there aren't many
  const maxNumbersWithoutDots = boundaryCount * 2 + siblingCount * 2 + 1;
  if (total <= maxNumbersWithoutDots) return range(1, total);

  const startPages = range(1, Math.min(boundaryCount, total));
  const endPages = range(Math.max(total - boundaryCount + 1, 1), total);

  const middleStart = Math.max(current - siblingCount, boundaryCount + 1);
  const middleEnd = Math.min(current + siblingCount, total - boundaryCount);
  const middlePages =
    middleEnd >= middleStart ? range(middleStart, middleEnd) : [];

  const pages: Array<number | typeof DOTS> = [];

  // start
  pages.push(...startPages);

  // left dots
  if (
    middlePages.length &&
    middlePages[0] > (startPages[startPages.length - 1] ?? 0) + 1
  ) {
    pages.push(DOTS);
  }

  // middle
  pages.push(...middlePages);

  // right dots
  if (
    middlePages.length &&
    endPages[0] > (middlePages[middlePages.length - 1] ?? 0) + 1
  ) {
    pages.push(DOTS);
  } else if (
    !middlePages.length &&
    endPages[0] > (startPages[startPages.length - 1] ?? 0) + 1
  ) {
    pages.push(DOTS);
  }

  // end
  pages.push(...endPages);

  // order-preserving de-dup (removes 1,2,1,2 cases; also collapses repeated DOTS)
  const seen = new Set<number>();
  const out: Array<number | typeof DOTS> = [];
  for (const x of pages) {
    if (x === DOTS) {
      if (out[out.length - 1] !== DOTS) out.push(DOTS);
    } else if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

export const Paginator = ({
  currentPage,
  pageSize = 10,
  totalPages,
  onPageChange,
  showPreviousNext,
  siblingCount = 2,
  boundaryCount = 2,
}: PaginatorProps) => {
  // compute total page count from total items
  const total = Math.max(
    1,
    Math.ceil((totalPages || 0) / Math.max(1, pageSize))
  );
  const cpage = Math.min(Math.max(1, (currentPage ?? 0) + 1), total); // 1-based

  const pages = getPaginationRange(total, cpage, siblingCount, boundaryCount);
  const isFirst = cpage === 1;
  const isLast = cpage === total;

  return (
    <Pagination>
      <PaginationContent className="bg-earth-bg h-[51px] rounded-[30px] flex items-center justify-center gap-2 px-2">
        {showPreviousNext && (
          <PaginationItem>
            <PaginationPrevious
              className={`${
                isFirst
                  ? 'bg-primary-bg text-white rounded-[50%]'
                  : 'cursor-pointer bg-primary-bg text-quinary-bg rounded-[50%] hover:bg-scrollbar hover:text-quinary-bg'
              }`}
              onClick={(e) => {
                e.preventDefault();
                if (!isFirst) onPageChange(cpage - 2); // back to 0-based
              }}
            />
          </PaginationItem>
        )}

        {pages.map((p, idx) =>
          p === DOTS ? (
            <PaginationItem key={`dots-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p as number}>
              <PaginationLink
                className={`${
                  (p as number) === cpage
                    ? 'bg-scrollbar text-primary-bg !hover:bg-scrollbar !hover:text-primary-bg !rounded-full'
                    : 'cursor-pointer text-primary-bg text-[14px] leading-5 font-semibold hover:bg-scrollbar !rounded-full hover:text-primary-bg'
                }`}
                isActive={(p as number) === cpage}
                onClick={(e) => {
                  e.preventDefault();
                  const zero = (p as number) - 1;
                  if (zero !== currentPage) onPageChange(zero);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {showPreviousNext && (
          <PaginationItem>
            <PaginationNext
              className={`${
                isLast
                  ? 'bg-primary-bg text-white rounded-[50%]'
                  : 'cursor-pointer bg-primary-bg text-white rounded-[50%] hover:bg-scrollbar hover:text-primary-bg'
              }`}
              onClick={(e) => {
                e.preventDefault();
                if (!isLast) onPageChange(cpage); // next (0-based)
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
