"use client"
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeLeadModal } from "@/redux/features/leadSlice";

const LeadDetailsModal = () => {
   const dispatch = useDispatch();
   // 1. Grab state from Redux
   const { isModalOpen, selectedLead } = useSelector((state: any) => state.lead);

   // 2. If closed, don't render anything
   if (!isModalOpen || !selectedLead) return null;

   return (
      <>
         {/* Dark Background Overlay */}
         <div 
            className="modal-backdrop fade show" 
            style={{ zIndex: 1050 }}
            onClick={() => dispatch(closeLeadModal())}
         ></div>

         {/* Modal Box */}
         <div 
            className="modal fade show d-block" 
            tabIndex={-1} 
            role="dialog"
            style={{ zIndex: 1055 }}
         >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
               <div className="modal-content shadow-lg">
                  
                  {/* Header */}
                  <div className="modal-header bg-light">
                     <h5 className="modal-title">
                        {selectedLead.status} Details
                     </h5>
                     <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => dispatch(closeLeadModal())}
                        aria-label="Close"
                     ></button>
                  </div>

                  {/* Body */}
                  <div className="modal-body p-4">
                     {/* Dynamic Data Content */}
                     <div className="row mb-3">
                        <div className="col-md-6">
                           <h6>Property Address</h6>
                           <p className="fs-5">{selectedLead.masked ? "🔒 Upgrade to View" : selectedLead.address}</p>
                        </div>
                        <div className="col-md-6 text-end">
                           <h6>Equity Potential</h6>
                           <p className="fs-4 text-success fw-bold">${selectedLead.price.toLocaleString()}</p>
                        </div>
                     </div>

                     <hr/>

                     <div className="alert alert-info">
                        <strong>Auction Date:</strong> {selectedLead.auction_date}
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer">
                     <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => dispatch(closeLeadModal())}
                     >
                        Close
                     </button>
                     <button type="button" className="btn btn-primary">
                        Save to Favorites
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default LeadDetailsModal;