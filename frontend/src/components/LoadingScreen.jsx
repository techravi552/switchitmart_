// import { MapPin } from 'lucide-react';

// export default function LoadingScreen() {
//   return (
//     <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-orange">
//           <MapPin size={32} className="text-white" />
//         </div>
//         <p className="font-display font-bold text-xl text-gray-800">Local<span className="text-brand-500">Kart</span></p>
//         <p className="text-gray-400 text-sm mt-1">Loading...</p>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import "./LoadingScreen.css";

import leftLogo from "../assets/logo/right.png";
import rightLogo from "../assets/logo/left.png";
import mainLogo from "../assets/logo/logo-light.png";

export default function LoadingScreen() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (hide) return null;

  return (
    <div id="loading">
      <div className="logo-box">

        <img src={leftLogo} alt="left-logo" className="left-logo" />

        <img src={rightLogo} alt="right-logo" className="right-logo" />

        <img src={mainLogo} alt="main-logo" className="main-logo" />

      </div>
    </div>
  );
}