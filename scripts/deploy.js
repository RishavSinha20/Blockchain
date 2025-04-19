const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Upload = await hre.ethers.getContractFactory("Upload");
  
  // Deploy the contract
  console.log("Deploying Upload contract...");
  const upload = await Upload.deploy();
  
  // Wait for deployment to finish
  await upload.waitForDeployment();
  
  // Get the deployed contract address
  const address = await upload.getAddress();
  
  console.log("Upload contract deployed to:", address);
  console.log("Save this address to use in your frontend configuration");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
