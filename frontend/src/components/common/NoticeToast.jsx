import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function NoticeToast({ notice }) {
  if (!notice) return null;

  return (
    <div className={`notice-toast ${notice.type === 'error' ? 'notice-error' : 'notice-success'}`}>
      {notice.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <span>{notice.msg}</span>
    </div>
  );
}
