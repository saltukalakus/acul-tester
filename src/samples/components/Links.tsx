import React from 'react';

/**
 * Mock Links component for signup samples
 */
interface LinksProps {
  loginLink?: string;
  signupLink?: string;
}

export const Links: React.FC<LinksProps> = ({ loginLink, signupLink }) => {
  return (
    <div className="mt-6 text-center text-sm">
      {loginLink && (
        <div className="mb-2">
          <a 
            href={loginLink} 
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Already have an account? Log in
          </a>
        </div>
      )}
      {signupLink && (
        <div>
          <a 
            href={signupLink} 
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Don't have an account? Sign up
          </a>
        </div>
      )}
    </div>
  );
};
