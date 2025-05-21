import React from 'react';
import { MapIcon } from 'lucide-react';

const MapView = () => {
  return (
    <div className="min-h-full p-4">
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Map View</h3>
          <p className="mt-1 text-sm text-gray-500">Map integration will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;