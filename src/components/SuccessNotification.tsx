import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Confetti from './Confetti';

const SuccessNotification: React.FC = () => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Small delay before showing to allow for animation
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`fixed bottom-8 inset-x-0 flex justify-center z-50 transition-transform duration-500 ease-out transform ${show ? 'translate-y-0' : 'translate-y-32'}`}>
      <div className="bg-green-600 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg flex items-center relative overflow-hidden max-w-md">
        <Confetti />
        <CheckCircle className="h-6 w-6 mr-3 text-white" />
        <div>
          <h3 className="font-bold">Success!</h3>
          <p className="text-green-100">Repository structure successfully visualized</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;