import Link from "next/link"

const DeleteModal = () => {
   return (
      <>
         <div className="modal fade" id="deleteModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
               <div className="container">
                  <div className="remove-account-popup text-center modal-content">
                     <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                     <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <i className="fa-solid fa-trash" style={{ fontSize: 32, color: '#ef4444' }}></i>
                     </div>
                     <h2>Are you sure?</h2>
                     <p>Are you sure to delete your account? All data will be lost.</p>
                     <div className="button-group d-inline-flex justify-content-center align-items-center pt-15">
                        <Link href="#" className="confirm-btn fw-500 tran3s me-3">Yes</Link>
                        <button type="button" className="btn-close fw-500 ms-3" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

export default DeleteModal
