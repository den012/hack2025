import React from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const API_URL = import.meta.env.env.VITE_API_URL;
  const [response, setReponse ] = React.useState<string>('');
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/greet`, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        }
      });
      setReponse(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <div>
      <h1 className="text-blue-300">Hello, World!</h1>
      <button onClick={fetchData} className="px-4 py-2 bg-green-500 text-white rounded">Fetch Greeting</button>
      {response && <p className="mt-4 text-gray-700">{response}</p>}
    </div>
  )
} 

export default App;