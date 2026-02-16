import Link from "next/link"

// 1. Updated Interface for Text-Only Data
interface DataType {
   id: number;
   tag: string;
   price: number;
   address: string;
   city: string;
}

// 2. Text-Based Mock Data (No Images)
const offcanvas_data: DataType[] = [
   {
      id: 1,
      tag: "FORECLOSURE",
      price: 221000,
      address: "6391 Elgin St",
      city: "Celina, DE"
   },
   {
      id: 2,
      tag: "TAX DEFAULT",
      price: 154000,
      address: "2245 Ridge Ave",
      city: "Austin, TX"
   },
   {
      id: 3,
      tag: "DIVORCE",
      price: 340500,
      address: "9012 Main Blvd",
      city: "Miami, FL"
   },
   {
      id: 4,
      tag: "PRE-FORECLOSURE",
      price: 78420,
      address: "1104 Pine Rd",
      city: "Denver, CO"
   },
]

const Offcanvas = ({ offCanvas, setOffCanvas }: any) => {
   return (
      <>
         <div className={`offcanvas offcanvas-end sidebar-nav ${offCanvas ? "show" : ""}`} id="sideNav">
            <div className="offcanvas-header">
               <div className="logo order-lg-0">
                  <Link href="/" className="d-flex align-items-center text-decoration-none">
                     {/* Replaced Image Logo with Text */}
                     <span className="fw-bold fs-2 text-dark">99Sellers</span>
                  </Link>
               </div>
               <button onClick={() => setOffCanvas(false)} type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="wrapper mt-60">
               <div className="d-flex flex-column h-100">
                  <div className="property-block">
                     <h4 className="title pb-25">Recent Leads</h4>
                     <div className="row">
                        {offcanvas_data.map((item) => (
                           <div key={item.id} className="col-12">
                              {/* Text-Only Card Style */}
                              <div className="listing-card-one shadow-none style-two mb-30 border-bottom pb-3">
                                 <div className="property-info">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                       <span className={`badge ${item.tag === 'FORECLOSURE' ? 'bg-danger' : 'bg-primary'} text-white`}>
                                          {item.tag}
                                       </span>
                                       <strong className="price fw-500 text-success">${item.price.toLocaleString()}</strong>
                                    </div>
                                    <h6 className="mb-1">{item.address}</h6>
                                    <p className="m-0 text-muted small">{item.city}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="address-block mt-50">
                     <h4 className="title pb-15">Contact Support</h4>
                     <p>Need help finding leads? <br />Email our support team.</p>
                     <p>
                        <Link href="mailto:support@99sellers.com" className="text-dark fw-500">support@99sellers.com</Link>
                     </p>
                  </div>
                  
                  <ul className="style-none d-flex flex-wrap w-100 justify-content-between align-items-center social-icon pt-25 mt-auto">
                     <li><Link href="#"><i className="fa-brands fa-whatsapp"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-twitter"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-instagram"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-linkedin"></i></Link></li>
                  </ul>
               </div>
            </div>
         </div>
         <div onClick={() => setOffCanvas(false)} className={`offcanvas-backdrop fade ${offCanvas ? "show" : ""}`}></div>
      </>
   )
}

export default Offcanvas