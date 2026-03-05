import Link from "next/link"
import { DeleteModal } from "@/modules/UserSupport_Module";

const Profile = () => {
   return (
      <>
         <div className="user-name-data">
            <ul className="dropdown-menu" aria-labelledby="profile-dropdown">
               <li>
                  <Link className="dropdown-item d-flex align-items-center" href="/profile">
                     <i className="fa-solid fa-user"></i>
                     <span className="ms-2 ps-1">Profile</span>
                  </Link>
               </li>
               <li>
                  <Link className="dropdown-item d-flex align-items-center" href="/account-settings">
                     <i className="fa-solid fa-gear"></i>
                     <span className="ms-2 ps-1">Account Settings</span>
                  </Link>
               </li>
               <li>
                  <Link className="dropdown-item d-flex align-items-center" href="#" data-bs-toggle="modal" data-bs-target="#deleteModal">
                     <i className="fa-solid fa-trash" style={{ color: '#ef4444' }}></i>
                     <span className="ms-2 ps-1">Delete Account</span>
                  </Link>
               </li>
            </ul>
         </div>
         <DeleteModal />
      </>
   )
}

export default Profile
