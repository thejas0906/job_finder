import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Pagination() {
  return (
    <div className="pagination">
      <button className="page-btn prev-btn disabled">
        <FiChevronLeft />
        Previous
      </button>
      <div className="page-numbers">
        <button className="page-number active">1</button>
      </div>
      <button className="page-btn next-btn disabled">
        Next
        <FiChevronRight />
      </button>
    </div>
  );
}

export default Pagination;
