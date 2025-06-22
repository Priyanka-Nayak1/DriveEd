import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score || 0;
  const passed = score >= 27;

  const handleDownload = () => {
    // For now, just alert or navigate to a dummy certificate page
    navigate("/certificate")
    
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
      <h1 className="text-4xl font-bold mb-4">
        {passed ? 'Congratulations! 🎉' : 'Try Again!'}
      </h1>
      <p className="text-xl mb-6">Your Score: <span className="font-bold">{score}/30</span></p>

      {passed && (
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Get Certificate
        </button>
      )}

      <button
        onClick={() => navigate('/')}
        className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
      >
        Go Back to Course again
      </button>
    </div>
  );
};

export default Result;
