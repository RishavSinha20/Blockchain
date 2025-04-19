import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: "d60d56bcfb28a0a353d6",
            pinata_secret_api_key: "8ee03027fdf4528d415dee751d0309fed56cd491631d64f06c0497868e9ac07a",
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        await contract.add(account, ImgHash);
        alert("File uploaded successfully!");
        setFileName("No file selected");
        setFile(null);
      } catch (e) {
        console.error(e);
        alert("Unable to upload file to Pinata");
      } finally {
        setUploading(false);
      }
    }
  };

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    if (!data) return;
    
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(data);
    };
    setFileName(data.name);
    e.preventDefault();
  };

  return (
    <div className="upload-container card">
      <h2 className="card-title">Upload Files</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="upload-card">
          <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="upload-instructions">Drag and drop your files here, or click to browse</p>
          <label htmlFor="file-upload" className="file-label">
            Choose File
          </label>
          <input
            disabled={!account}
            type="file"
            id="file-upload"
            name="data"
            onChange={retrieveFile}
            className="file-input"
          />
          <span className="file-name">{fileName}</span>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary upload-btn" 
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
