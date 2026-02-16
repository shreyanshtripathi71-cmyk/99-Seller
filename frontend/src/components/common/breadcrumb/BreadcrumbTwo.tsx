import Link from "next/link"

const BreadcrumbTwo = ({ title, sub_title }: any) => {
   return (
      <div className="inner-banner-three inner-banner text-center z-1 position-relative">
         <div className="bg-wrapper overflow-hidden position-relative z-1" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container position-relative z-2">
               <h2 className="mb-35 xl-mb-20 md-mb-10 pt-15 font-garamond text-white">{title}</h2>
               <ul className="theme-breadcrumb style-none d-inline-flex align-items-center justify-content-center position-relative z-1 bottom-line">
                  <li><Link href="/">Home</Link></li>
                  <li>/</li>
                  <li>{sub_title}</li>
               </ul>
            </div>
         </div>
      </div>
   )
}

export default BreadcrumbTwo
