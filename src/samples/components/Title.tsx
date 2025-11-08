import React from 'react';

/**
 * Mock Title component for signup samples
 */
interface TitleProps {
  screenTexts?: {
    title?: string;
    description?: string;
  };
}

export const Title: React.FC<TitleProps> = ({ screenTexts }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {screenTexts?.title || 'Sign Up'}
      </h2>
      {screenTexts?.description && (
        <p className="mt-2 text-sm text-gray-600">{screenTexts.description}</p>
      )}
    </div>
  );
};
