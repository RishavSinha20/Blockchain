import { useState, useEffect } from "react";
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
        console.log("Raw data from contract:", str_array);
        
        // Process the URLs correctly
        const processedData = str_array.map((item) => {
          // Clean up the URL
          let url = item.trim();
          
          // Handle ipfs:// protocol
          if (url.startsWith('ipfs://')) {
            return {
              original: url,
              display: `https://gateway.pinata.cloud/ipfs/${url.substring(7)}`
            };
          } 
          // For URLs already in Pinata format
          else if (url.includes('gateway.pinata.cloud/ipfs/')) {
            return {
              original: url,
              display: url
            };
          }
          // For any other format, try to extract what looks like a CID
          else {
            // Try to find something that looks like a CID in the URL
            const match = url.match(/Qm[1-9A-HJ-NP-Za-km-z]{44,}|ba[A-Za-z2-7]{57,}/);
            if (match) {
              return {
                original: url,
                display: `https://gateway.pinata.cloud/ipfs/${match[0]}`
              };
            } else {
              // Fallback - use the last part of the URL as potential CID
              const parts = url.split('/');
              const lastPart = parts[parts.length - 1];
              return {
                original: url,
                display: `https://gateway.pinata.cloud/ipfs/${lastPart}`
              };
            }
          }
        });
        
        console.log("Processed URLs:", processedData);
        setData(processedData);
      } else {
        setData([]);
        alert("No files to display");
      }
    } catch (e) {
      console.error("Error fetching files:", e);
      alert("You don't have access to these files");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Try multiple gateways if one fails
  const handleImageError = (e, index) => {
    console.log("Image failed to load:", e.target.src);
    
    // Try a different gateway if the current one fails
    const currentSrc = e.target.src;
    
    if (currentSrc.includes('gateway.pinata.cloud')) {
      // Try IPFS.io gateway instead
      e.target.src = currentSrc.replace(
        'gateway.pinata.cloud/ipfs', 
        'ipfs.io/ipfs'
      );
    } 
    else if (currentSrc.includes('ipfs.io')) {
      // Try dweb.link gateway
      e.target.src = currentSrc.replace(
        'ipfs.io/ipfs', 
        'dweb.link/ipfs'
      );
    }
    else {
      // If all gateways fail, show placeholder
      e.target.onerror = null; // Prevent infinite fallback
      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgNTEuMzMzM0M2MC4wNDk5IDUxLjMzMzMgNDQgNjcuMzgzMiA0NCA4Ny4zMzMzQzQ0IDEwNy4yODMgNjAuMDQ5OSAxMjMuMzMzIDgwIDEyMy4zMzNDOTkuOTUwMSAxMjMuMzMzIDExNiAxMDcuMjgzIDExNiA4Ny4zMzMzQzExNiA2Ny4zODMyIDk5Ljk1MDEgNTEuMzMzMyA4MCA1MS4zMzMzWk04MCA1OC42NjY3Qzg1LjMwMzMgNTguNjY2NyA4OS42IDYyLjk2MzMgODkuNiA2OC4yNjY3Qzg5LjYgNzMuNTcgODUuMzAzMyA3Ny44NjY3IDgwIDc3Ljg2NjdDNzQuNjk2NyA3Ny44NjY3IDcwLjQgNzMuNTcgNzAuNCA2OC4yNjY3QzcwLjQgNjIuOTYzMyA3NC42OTY3IDU4LjY2NjcgODAgNTguNjY2N1pNODAgMTE2Ljg2N0M2Ny43IDExNi44NjcgNTcuMDIgMTEwLjY2MyA1MS4zMzMzIDEwMS4xOEM1MS4zMzMzIDk0LjM2NjcgNjYuODIgOTAuNjY2NyA4MCA5MC42NjY3QzkzLjE4IDkwLjY2NjcgMTA4LjY2NyA5NC4zNjY3IDEwOC42NjcgMTAxLjE4QzEwMyAxMTAuNjYzIDkyLjMgMTE2Ljg2NyA4MCAxMTYuODY3WiIgZmlsbD0iI0EwQUVDMCIvPjwvc3ZnPg==";
      e.target.alt = "File preview unavailable";
      e.target.style.opacity = "0.5";
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
        <div className="file-display">
          <div className="image-grid">
            {data.map((item, i) => (
              <div key={i} className="file-preview-card">
                <a href={item.display} target="_blank" rel="noopener noreferrer" className="image-item">
                  <img 
                    src={item.display} 
                    alt={`File ${i+1}`} 
                    onError={(e) => handleImageError(e, i)}
                    loading="lazy"
                  />
                </a>
                <div className="file-info">
                  <span className="file-number">File {i+1}</span>
                  <a href={item.display} target="_blank" rel="noopener noreferrer" className="file-view-link">
                    View Full Size
                  </a>
                </div>
              </div>
            ))}
          </div>
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
