"use client";
import { useEffect, useState } from 'react';

export default function useLeadPagination<T>(items: T[] = [], itemsPerPage = 10) {
   const [itemOffset, setItemOffset] = useState(0);
   const [currentItems, setCurrentItems] = useState<T[]>([]);

   useEffect(() => {
      const safeItems = Array.isArray(items) ? items : [];
      const endOffset = itemOffset + itemsPerPage;
      setCurrentItems(safeItems.slice(itemOffset, endOffset));
   }, [itemOffset, items, itemsPerPage]);

   const pageCount = Math.max(1, Math.ceil((Array.isArray(items) ? items.length : 0) / itemsPerPage));

   const handlePageClick = (event: { selected: number } | any) => {
      const safeItems = Array.isArray(items) ? items : [];
      if (safeItems.length === 0) return;
      const newOffset = (event?.selected ?? 0) * itemsPerPage;
      setItemOffset(newOffset % safeItems.length);
   };

   return { currentItems, pageCount, handlePageClick };
}