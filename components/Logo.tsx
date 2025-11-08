import React from 'react';

/**
 * Mock Logo component
 * This is a placeholder for the Auth0 internal Logo component
 */
export const Logo: React.FC = () => {
  return (
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-2xl">A0</span>
      </div>
    </div>
  );
};
