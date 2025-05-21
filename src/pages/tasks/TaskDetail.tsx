import React from 'react';
import { useParams } from 'react-router-dom';

function TaskDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Details</h1>
      <p className="text-gray-600">Task ID: {id}</p>
    </div>
  );
}

export default TaskDetail;