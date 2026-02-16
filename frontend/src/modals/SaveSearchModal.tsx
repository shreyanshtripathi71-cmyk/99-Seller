"use client"
import React, { useState } from "react";

interface SaveSearchModalProps {
   onClose: () => void;
   onSave: (name: string) => void;
   filters?: any;
}

const SaveSearchModal = ({ onClose, onSave, filters }: SaveSearchModalProps) => {
   const [searchName, setSearchName] = useState("");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchName.trim()) {
         onSave(searchName);
      }
   };

   return (
      // Modal Overlay (Bootstrap style)
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex={-1}>
         <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '15px', overflow: 'hidden'}}>
               
               {/* Header */}
               <div className="modal-header border-bottom-0 pb-0 ps-4 pe-4 pt-4">
                  <h5 className="modal-title fw-bold text-dark">Save this Search</h5>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
               </div>

               {/* Body */}
               <div className="modal-body px-4 pb-4 pt-2">
                  <p className="text-muted small mb-4">
                     Name this search to receive email alerts when new properties match these criteria.
                  </p>
                  
                  <form onSubmit={handleSubmit}>
                     {/* Input Group reusing your 'dash-input-wrapper' style */}
                     <div className="dash-input-wrapper mb-3">
                        <label htmlFor="searchName" className="small fw-bold text-dark mb-1">Search Name</label>
                        <input 
                           type="text" 
                           id="searchName"
                           className="form-control"
                           style={{height: '50px', borderRadius: '8px'}}
                           placeholder="e.g. Austin Foreclosures < $300k"
                           value={searchName}
                           onChange={(e) => setSearchName(e.target.value)}
                           autoFocus
                        />
                     </div>

                     {/* Filter Summary (Optional: Shows user what they are saving) */}
                     {filters && (
                        <div className="p-3 bg-light rounded-3 mb-4 border border-light">
                           <div className="small fw-bold text-uppercase text-muted mb-2" style={{fontSize: '10px'}}>Active Filters</div>
                           <div className="d-flex flex-wrap gap-2">
                              {Object.entries(filters).map(([key, value]) => (
                                 (value && value !== 'All' && value !== 'Any' && value !== '0') ? (
                                    <span key={key} className="badge bg-white text-dark border fw-normal shadow-sm">
                                       {key}: {String(value)}
                                    </span>
                                 ) : null
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="d-flex gap-2 mt-2">
                        <button type="button" className="btn btn-light flex-fill rounded-pill fw-bold" onClick={onClose}>Cancel</button>
                        {/* Uses template primary button color */}
                        <button type="submit" className="btn btn-primary flex-fill rounded-pill fw-bold" style={{backgroundColor: '#2563EB', borderColor: '#2563EB'}}>
                           Save Search
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default SaveSearchModal;