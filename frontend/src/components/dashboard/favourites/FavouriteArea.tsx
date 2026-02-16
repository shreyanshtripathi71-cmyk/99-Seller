"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactPaginate from "react-paginate";
import useLeadPagination from "@/hooks/useLeadPagination";
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo";

// FIX: Added 'zip', 'state', 'county', 'auction_date' to match the 'Lead' interface logic
const fav_leads: any[] = [
   { id: 1, address: "1234 Maple Ave", city: "Dallas", state: "TX", zip: "75001", county: "Dallas", price: 150000, status: "Foreclosure", auction_date: "Oct 24, 2023" },
   { id: 2, address: "5678 Oak Lane", city: "Austin", state: "TX", zip: "78001", county: "Travis", price: 320000, status: "Tax Default", auction_date: "Oct 22, 2023" },
   { id: 3, address: "999 Pine St", city: "Houston", state: "TX", zip: "77001", county: "Harris", price: 85000, status: "Divorce", auction_date: "Oct 20, 2023" },
   { id: 4, address: "444 Elm Dr", city: "San Antonio", state: "TX", zip: "78201", county: "Bexar", price: 210000, status: "Pre-Foreclosure", auction_date: "Oct 18, 2023" },
   { id: 5, address: "777 Cedar Rd", city: "Miami", state: "FL", zip: "33101", county: "Dade", price: 450000, status: "Auction", auction_date: "Oct 15, 2023" },
];

const FavouriteArea = () => {
   // Pagination Hook
   const { currentItems, pageCount, handlePageClick } = useLeadPagination(fav_leads, 8);

   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   if (!mounted) return null;

   return (
      <div className="d-flex w-100 min-vh-100 bg-light overflow-hidden">

         <div className="flex-shrink-0">
            <DashboardHeaderTwo />
         </div>

         <div className="flex-grow-1 d-flex flex-column" style={{ overflowX: "hidden" }}>
            <div className="h-100 p-4 p-xl-5 overflow-auto">

               <div className="d-flex align-items-center justify-content-between mb-30 lg-mb-20">
                  <div>
                     <h3 className="fw-bold text-dark m0">Saved Leads</h3>
                     <p className="fs-16 text-muted m0">Manage your shortlisted properties.</p>
                  </div>
                  <Link href="/search" className="btn-five text-uppercase rounded-3 fw-600 fs-14 shadow-sm">
                     <i className="fa-light fa-plus me-2"></i> Add New
                  </Link>
               </div>

               <div className="bg-white border-20 p-4 shadow-sm">
                  <div className="table-responsive">
                     <table className="table table-hover align-middle custom-table-2">
                        <thead>
                           <tr className="text-uppercase fs-11 text-muted bg-light">
                              <th className="py-3 ps-3 rounded-start">Property</th>
                              <th className="py-3">Status</th>
                              <th className="py-3">Est. Equity</th>
                              <th className="py-3">Date Added</th>
                              <th className="py-3 text-end pe-3 rounded-end">Action</th>
                           </tr>
                        </thead>
                        <tbody className="border-top-0">
                           {currentItems.map((item: any) => (
                              <tr
                                 key={item.id}
                                 onClick={() => window.location.href = `/property/${item.id}`}
                                 style={{ cursor: "pointer" }}
                                 className="hover-row"
                              >
                                 <td className="ps-3">
                                    <div className="d-flex align-items-center">
                                       <div className="icon-box rounded-3 bg-light d-flex align-items-center justify-content-center me-3 text-dark"
                                          style={{ width: 40, height: 40, fontSize: '18px' }}>
                                          <i className="fa-light fa-house"></i>
                                       </div>
                                       <div>
                                          <h6 className="m-0 fs-14 fw-bold text-dark">{item.address}</h6>
                                          <span className="text-muted fs-12">{item.city}, {item.state}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td>
                                    <span style={{
                                       display: "inline-block",
                                       padding: "4px 10px",
                                       borderRadius: 6,
                                       fontSize: 12,
                                       fontWeight: 600,
                                       background: "#EFF6FF",
                                       color: "#2563EB",
                                       border: "1px solid #BFDBFE",
                                    }}>
                                       {item.status}
                                    </span>
                                 </td>
                                 <td>
                                    <div className="text-success fw-bold fs-14">${item.price.toLocaleString()}</div>
                                 </td>
                                 <td className="text-dark fs-14">{item.auction_date}</td>
                                 <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                                    <Link
                                       href={`/property/${item.id}`}
                                       className="btn-four rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition-3s me-2"
                                       title="View Details"
                                       style={{ width: 30, height: 30 }}
                                    >
                                       <i className="fa-light fa-eye text-primary"></i>
                                    </Link>
                                    <button className="btn-four rounded-circle p-0 d-inline-flex align-items-center justify-content-center transition-3s me-2"
                                       title="Remove" style={{ width: 30, height: 30 }}>
                                       <i className="fa-light fa-trash text-danger"></i>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                     <ReactPaginate
                        breakLabel="..."
                        nextLabel={<i className="fa-regular fa-chevron-right"></i>}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel={<i className="fa-regular fa-chevron-left"></i>}
                        renderOnZeroPageCount={null}
                        className="pagination-one d-flex align-items-center justify-content-center style-none"
                        pageClassName="page-item"
                        activeClassName="active"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default FavouriteArea;