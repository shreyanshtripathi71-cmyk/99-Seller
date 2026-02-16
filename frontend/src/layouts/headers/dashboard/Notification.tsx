const Notification = () => {
   return (
      <ul className="dropdown-menu" aria-labelledby="notification-dropdown">
         <li>
            <h4>Notification</h4>
            <ul className="style-none notify-list">
               <li className="d-flex align-items-center unread">
                  <div className="icon d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)' }}>
                     <i className="fa-solid fa-envelope text-primary"></i>
                  </div>
                  <div className="flex-fill ps-2">
                     <h6>You have 3 new mails</h6>
                     <span className="time">3 hours ago</span>
                  </div>
               </li>
               <li className="d-flex align-items-center">
                  <div className="icon d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}>
                     <i className="fa-solid fa-check" style={{ color: '#10b981' }}></i>
                  </div>
                  <div className="flex-fill ps-2">
                     <h6>Your listing post has been approved</h6>
                     <span className="time">1 day ago</span>
                  </div>
               </li>
               <li className="d-flex align-items-center unread">
                  <div className="icon d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)' }}>
                     <i className="fa-solid fa-calendar-xmark" style={{ color: '#ef4444' }}></i>
                  </div>
                  <div className="flex-fill ps-2">
                     <h6>Your meeting is cancelled</h6>
                     <span className="time">3 days ago</span>
                  </div>
               </li>
            </ul>
         </li>
      </ul>
   )
}

export default Notification
