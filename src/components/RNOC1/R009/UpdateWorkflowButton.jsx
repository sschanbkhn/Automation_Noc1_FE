import React, { useState } from 'react';
import { testUpdateWorkflow } from './api';

const UpdateWorkflowButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    try {
      await testUpdateWorkflow();
      setMessage('Cập nhật workflow thành công!');
    } catch (err) {
      setMessage('Có lỗi xảy ra khi cập nhật workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Đang cập nhật...' : 'Cập nhật Workflow'}
      </button>
      {message && <div style={{ marginTop: 10 }}>{message}</div>}
    </div>
  );
};

export default UpdateWorkflowButton; 