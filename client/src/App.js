import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        
        try {
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          
          const address = await signer.getAddress();
          
          setAccount(address);
          let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

          const contract = new ethers.Contract(
            contractAddress,
            Upload.abi,
            signer
          );
          
          setContract(contract);
          setProvider(provider);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        console.error("Metamask is not installed");
      }
    };
    
    if (window.ethereum) {
      loadProvider();
    }
  }, []);

  return (
    <>
      {!modalOpen && (
        <button className="share-btn" onClick={() => setModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      )}
      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
      )}

      <div className="App">
        <header className="app-header">
          <h1>NexusVault</h1>
          <div className={`account-info ${!account ? 'not-connected' : ''}`}>
            <span className="dot"></span>
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected to MetaMask"}
          </div>
        </header>

        <div className="content-container">
          <FileUpload
            account={account}
            provider={provider}
            contract={contract}
          />
          <Display contract={contract} account={account} />
        </div>
      </div>
    </>
  );
}

export default App;
