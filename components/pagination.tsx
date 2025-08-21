import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to generate page numbers with ellipsis
const generatePageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const showEllipsis = totalPages > 7;
  
  if (!showEllipsis) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage > 4) {
      pages.push('ellipsis-start');
    }
    
    // Show current page and surrounding pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    if (currentPage < totalPages - 3) {
      pages.push('ellipsis-end');
    }
    
    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
  }
  
  return pages;
};

const EnhancedPagination = ({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  loading,
  onPageChange,
  t
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  
  const goToFirstPage = () => onPageChange(1);
  const goToLastPage = () => onPageChange(totalPages);
  const goToPrevPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const goToNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          {t("transactions.showingResults") || "Showing"}: {totalCount} {totalCount === 1 ? (t("common.result") || "result") : (t("common.results") || "results")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        {t("transactions.showingResults") || "Showing"} <span className="font-medium">{startIndex + 1}-{endIndex}</span> {t("common.of") || "of"} <span className="font-medium">{totalCount.toLocaleString()}</span> {t("common.results") || "results"}
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={currentPage === 1 || loading}
          className="hidden sm:inline-flex"
          title={t("pagination.firstPage") || "First page"}
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-1" />
        </Button>
        
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={currentPage === 1 || loading}
          title={t("common.previous") || "Previous page"}
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">{t("common.previous") || "Previous"}</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <div key={`ellipsis-${index}`} className="px-2 py-1 flex items-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            }
            
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`min-w-[2.25rem] ${page === currentPage ? 'pointer-events-none' : ''}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || loading}
          title={t("common.next") || "Next page"}
        >
          <span className="hidden sm:inline">{t("common.next") || "Next"}</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
        
        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={currentPage === totalPages || loading}
          className="hidden sm:inline-flex"
          title={t("pagination.lastPage") || "Last page"}
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Usage example:
const TransactionsPagination = () => {
  return (
    <EnhancedPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      itemsPerPage={itemsPerPage}
      loading={loading}
      onPageChange={setCurrentPage}
      t={t}
    />
  );
};