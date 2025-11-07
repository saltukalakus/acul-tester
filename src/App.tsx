import React, { useState, useEffect } from 'react';

interface SampleManifest {
  [key: string]: {
    filename: string;
    samplesCount: number;
  };
}

function App() {
  const [samples, setSamples] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load the manifest to get list of available samples
    fetch('/src/samples/manifest.json')
      .then(res => res.json())
      .then((manifest: SampleManifest) => {
        const sampleNames = Object.keys(manifest);
        setSamples(sampleNames);
        if (sampleNames.length > 0) {
          setSelectedSample(sampleNames[0]);
        }
      })
      .catch(err => {
        console.error('Error loading manifest:', err);
        setError('Failed to load samples. Run "npm run fetch-samples" first.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Auth0 ACUL Samples
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Interactive examples from the Auth0 Universal Login SDK
              </p>
            </div>
            <a
              href="https://github.com/auth0/universal-login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Source
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <p className="mt-2 text-sm text-red-700">
                  Run <code className="bg-red-100 px-2 py-1 rounded">npm install</code> and <code className="bg-red-100 px-2 py-1 rounded">npm run fetch-samples</code> to download the samples.
                </p>
              </div>
            </div>
          </div>
        ) : samples.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading samples...</h3>
            <p className="mt-1 text-sm text-gray-500">Please wait while we load the Auth0 ACUL samples.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Screens
                </h2>
                <nav className="space-y-1">
                  {samples.map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setSelectedSample(sample)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedSample === sample
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {sample.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedSample.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-6">
                    This is a placeholder for the <strong>{selectedSample}</strong> component.
                    The actual component will be loaded from the fetched samples.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> To see the actual Auth0 ACUL components in action, 
                      you'll need to integrate them with your Auth0 tenant configuration. 
                      This viewer shows the structure and styling of the components fetched 
                      from the official repository.
                    </p>
                  </div>
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Information</h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Component File</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <code className="bg-gray-100 px-2 py-1 rounded">{selectedSample}.tsx</code>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Source</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a 
                            href={`https://github.com/auth0/universal-login/blob/master/packages/auth0-acul-js/examples/${selectedSample}.md`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            View on GitHub →
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Samples automatically fetched from{' '}
            <a 
              href="https://github.com/auth0/universal-login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Auth0 Universal Login Repository
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
