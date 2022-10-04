import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {

    // TODO: Add an option to make automatic jump to Goreli Test Network

    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [message, setMessage] = useState("This is a message");
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x02896970460425a83C70c1FBe25Be2bD9B0cc296";
  const contractABI = abi.abi;
  const [allWaves, setAllWaves] = useState([]);

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", account[0]);
      setCurrentAccount(account[0]);

      location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);
        
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        getAllWaves()
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      alert(error.error.message);
      console.log(error);
    }
  }
  
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          let temp = {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          }
          wavesCleaned.push(temp);
        });
        console.log("All waves:", wavesCleaned)
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
    getAllWaves();
  }, []);

  return (
    <div className="m-4 flex justify-center">
      <div className="w-full max-w-fit space-y-4 ">
        <div className=" p-4 m-2 rounded-lg">
          <h1 className="text-center font-bold">👋 Hey there!</h1>
          <p className="text-center"> I am Anubhav, full time backend dev at CoinSwitch Kuber.</p>
          <p className="text-center"> This is my first web3 project, say Hi to me.</p>

          {currentAccount ?
            (
              <div className="flex justify-center">
                <input
                  className="border-2 w-1/2 border-grey p-2 m-2 drop-shadow-lg"
                  type='text'
                  placeholder="Type your wave message"
                  onChange={(e) => setMessage(e.target.value)} />
                <button
                  className="border-2 p-2 m-2 bg-lime-400 
                    border-lime-600 hover:bg-lime-600  drop-shadow-lg
                    hover:drop-shadow-2xl hover:text-white"
                  onClick={wave}>
                  Wave at Me
                </button>

              </div>
            )
            :
            (
              <div className="text-center">
                <button
                  className="border-2 p-2 m-2 bg-lime-400 
                border-lime-600 hover:bg-lime-600 drop-shadow-lg
                hover:drop-shadow-2xl hover:text-white"
                  onClick={connectWallet}>
                  Connect Wallet
                </button>
              </div>
            )
          }
        </div>
        <div className="grid grid-cols-2">
          {allWaves.slice(0).reverse().map((wave, index) => {
            return (
              <div key={index} className="border-2 rounded-t-lg p-2 m-2 hover:bg-gray-100 hover:drop-shadow-lg">
                <h1 className="p-2 text-center font-medium">👋 {wave.message}</h1>
                <div className="flex justify-between">
                  <div className='p-2 w-1/3 truncate'> 👤 {wave.address}</div>
                  <div className='p-2 w-1/3 truncate text-right'>🗓 {wave.timestamp.toLocaleString()}</div>
                </div>
              </div>)
          })}
        </div>
      </div>
    </div>
  );
};

export default App;