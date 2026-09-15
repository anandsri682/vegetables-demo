import React from 'react';
import { Bell } from 'lucide-react';

export default function AdminNotificationsTab({ notifications }) {
  return (
    <div className="card-box">
      <h2>System Notifications & Inventory Alerts</h2>
      <div className="margin-top">
        {notifications.length === 0 ? (
          <p className="muted">No system notifications available.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="log-item card-box margin-bottom">
              <Bell size={16} />
              <div>
                <b>{n.title}:</b> {n.message}
                <br /><small className="muted">{new Date(n.created_at).toLocaleString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
