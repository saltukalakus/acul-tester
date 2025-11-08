import React from 'react';

/**
 * Mock FederatedLogin component for signup samples
 */
interface FederatedLoginProps {
  connections?: Array<{ name: string; displayName?: string }>;
  onFederatedLogin?: (connectionName: string) => void;
}

export const FederatedLogin: React.FC<FederatedLoginProps> = ({ 
  connections = [], 
  onFederatedLogin 
}) => {
  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        {connections.map((connection) => (
          <button
            key={connection.name}
            onClick={() => onFederatedLogin?.(connection.name)}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {connection.displayName || connection.name}
          </button>
        ))}
      </div>
    </div>
  );
};
