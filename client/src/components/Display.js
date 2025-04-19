import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const getdata = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      let dataArray;
      if (address) {
        dataArray = await contract.display(address);
      } else {
        dataArray = await contract.display(account);
      }
      
      const isEmpty = Object.keys(dataArray).length === 0;

      if (!isEmpty) {
        const str = dataArray.toString();
        const str_array = str.split(",");
        
        // Convert IPFS hashes to displayable URLs
        const processedData = str_array.map((item) => {
          return `https://gateway.pinata.cloud/ipfs/${item.substring(6)}`;
        });
        
        setData(processedData);
      } else {
        setData([]);
        alert("No files to display");
      }
    } catch (e) {
      console.error(e);
      alert("You don't have access to these files");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="display-container card">
      <h2 className="card-title">Your Files</h2>
      
      <input
        type="text"
        placeholder="Enter Ethereum Address (optional)"
        className="address-input"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      
      <button 
        className="btn btn-primary fetch-btn" 
        onClick={getdata}
        disabled={loading || !contract}
      >
        {loading ? "Loading..." : "Fetch Files"}
      </button>
      
      {data.length > 0 ? (
        <div className="image-grid">
          {data.map((url, i) => (
            <a href={url} key={i} target="_blank" rel="noopener noreferrer" className="image-item">
              <img src={url} alt={`File ${i+1}`} />
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {loading ? 
            "Loading files..." : 
            "No files to display. Click 'Fetch Files' to view your uploads."}
        </div>
      )}
    </div>
  );
};

export default Display;
