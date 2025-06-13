import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type PaginatorProps = {
  currentPage: number | any;
  pageSize?: number | any;
  totalPages: number | any;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
};

export const Paginator = ({
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  showPreviousNext,
}: PaginatorProps) => {
  const total: any = Math.ceil(totalPages / pageSize);
  const cpage = currentPage + 1;

  const pageNumbers = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationContent className="bg-earth-bg h-[51px] rounded-[30px] flex items-center justify-center gap-2">
        {showPreviousNext && (
          <PaginationItem>
            <PaginationPrevious
              className={`${cpage === 1 ? 'bg-mars-bg/50 text-lunar-bg rounded-[50%] hover:bg-mars-bg/50 hover:text-lunar-bg' : 'cursor-pointer bg-lunar-bg text-quinary-bg rounded-[50%] hover:bg-lunar-bg hover:text-quinary-bg'}`}
              onClick={() => cpage !== 1 && onPageChange(currentPage - 1)}
            />
          </PaginationItem>
        )}
        {/* bg-mars-bg/50 text-lunar-bg rounded-[50%] hover:bg-mars-bg/50 hover:text-lunar-bg */}
        {pageNumbers?.map((page: any) => {
          const pageNumber = page - 1;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                className={`${
                  page === cpage
                    ? 'bg-lunar-bg text-quinary-bg rounded-[50%] hover:bg-lunar-bg hover:text-quinary-bg'
                    : 'cursor-pointer text-lunar-bg rounded-[50%] text-[14px] leading-5 font-semibold hover:bg-mars-bg/50 hover:text-lunar-bg'
                }`}
                onClick={() => page !== cpage && onPageChange(pageNumber)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {showPreviousNext && (
          <PaginationItem>
            <PaginationNext
              className={`${total === cpage ? 'bg-mars-bg/50 text-lunar-bg rounded-[50%] hover:bg-mars-bg/50 hover:text-lunar-bg' : 'cursor-pointer bg-lunar-bg text-quinary-bg rounded-[50%] hover:bg-lunar-bg hover:text-quinary-bg'}`}
              onClick={() => total !== cpage && onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
    // <Pagination>
    //   <PaginationContent>
    //     {/* {showPreviousNext && totalPages && page > 1 ? ( */}
    //     <PaginationItem className="cursor-pointer">
    //       <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
    //     </PaginationItem>
    //     {/* ) : null} */}
    //     {/* {showPreviousNext && totalPages && page !== total ? ( */}
    //     <PaginationItem
    //       className={`${page === total && 'disabled bg-red'} cursor-pointer`}
    //     >
    //       <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
    //     </PaginationItem>
    //     {/* ) : null} */}
    //   </PaginationContent>
    // </Pagination>
    // <Pagination>
    //   <PaginationContent className="bg-earth-bg h-[51px] rounded-[30px]">
    //     <PaginationItem>
    //       <PaginationPrevious
    //         href="#"
    //         className="bg-mars-bg/50 text-lunar-bg rounded-[50%] hover:bg-mars-bg/50 hover:text-lunar-bg"
    //       />
    //     </PaginationItem>
    //     <PaginationItem>
    //       <PaginationLink
    //         href="#"
    //         className="text-lunar-bg text-[14px] leading-5 font-semibold hover:bg-transparent hover:text-lunar-bg"
    //       >
    //         1
    //       </PaginationLink>
    //     </PaginationItem>
    //     <PaginationItem>
    //       <PaginationNext
    //         href="#"
    //         className="bg-lunar-bg text-quinary-bg rounded-[50%] hover:bg-lunar-bg hover:text-quinary-bg"
    //       />
    //     </PaginationItem>
    //   </PaginationContent>
    // </Pagination>
  );
};
