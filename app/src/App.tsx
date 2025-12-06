import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/GoogleAuth/GoogleLogin';

// const App: React.FC = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [response, setReponse ] = React.useState<string>('');
//   const fetchData = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/greet`, {
//         headers: {
//           "Content-Type": "application/json",
//           "ngrok-skip-browser-warning": "true"
//         }
//       });
//       setReponse(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   }

//   return (
//     <div>
//       <h1 className="text-blue-300">Hello, World!</h1>
//       <button onClick={fetchData} className="px-4 py-2 bg-green-500 text-white rounded">Fetch Greeting</button>
//       {response && <p className="mt-4 text-gray-700">{response}</p>}
//     </div>
//   )
// } 


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App;