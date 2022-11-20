import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/BuyMeCoffee.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      alert("MetaMask required for this website")
      return;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      alert("No authorized account found")
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const myNetwork = {
    chainName: "Ethereum Testnet Görli",
    chainId: "0x5",
    nativeCurrency: { name: "Görli Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.goerli.mudit.blog/"],
  }
  const [message, setMessage] = useState("This is a message");
  const [name, setName] = useState("AnonymousRockstar")
  const [currentAccount, setCurrentAccount] = useState("");
  const [tip, setTip] = useState("0.001")
  const contractAddress = "0xae2AAC1E23CD23158e402A48D0C35f1764c91831";
  const contractABI = abi.abi;
  const [allMemos, setAllMemos] = useState([]);

  const SwitchToMyNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: myNetwork.chainId }]
      });
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      console.log("Error while switching", err)
      if (err.code === 4902) {
        console.log("Adding required network")
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [myNetwork]
        });
      }
    }
  }

  const connectWallet = async () => {
    try {
      await SwitchToMyNetwork()
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllMemos();
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bmcContract = new ethers.Contract(contractAddress, contractABI, signer);

        let memoList = await bmcContract.getMemos();
        console.log("Retrieved total memo count...", memoList.length);

        const newMemoTxn = await bmcContract.buyCoffee(name, message, { value: ethers.utils.parseEther(tip) });
        console.log("Mining...", newMemoTxn.hash);

        await newMemoTxn.wait();
        console.log("Mined -- ", newMemoTxn.hash);
        getAllMemos()

        memoList = await bmcContract.getMemos();
        console.log("Retrieved total wave count...", memoList.length);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      alert(error.error.message);
      console.log(error);
    }
  }

  const getAllMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bmcContract = new ethers.Contract(contractAddress, contractABI, signer);
        const memo_list = await bmcContract.getMemos();

        let normalisedMemoList = [];
        memo_list.forEach(memo => {
          let temp = {
            address: memo.from,
            name: memo.name,
            timestamp: new Date(memo.timestamp * 1000),
            message: memo.message
          }
          normalisedMemoList.push(temp);
        });
        console.log("All memos:", normalisedMemoList)
        setAllMemos(normalisedMemoList);
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
    getAllMemos();
  }, []);

  return (
    <div className="m-4 flex justify-center">
      <div className="w-full max-w-fit space-y-4 ">
        <div className=" p-4 m-2 rounded-lg ">
          <h1 className="my-4 text-center font-bold text-white">👋 Hey there!</h1>
          <div className="my-4 text-white">
            <p className="text-center"> I am Anubhav, full time backend dev at CoinSwitch Kuber.</p>
            <p className="text-center"> This is my first web3 project, say Hi to me.</p>
          </div>
          {currentAccount ?
            (
              <div className="flex flex-col md:flex md:justify-center">
                <div className="mx-2 text-center">
                  <input id="Name"
                    className="p-2 m-2 border-2 w-max rounded-lg
                  border-grey drop-shadow-lg"
                    type='text'
                    placeholder="Gavin Hooli"
                    onChange={(e) => setName(e.target.value)} />
                  <input
                    className="p-2 m-2 border-2 w-max rounded-lg
                  border-grey drop-shadow-lg"
                    type='text'
                    placeholder="Type your message"
                    onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="mx-2 text-center flex justify-center">
                  <div className="flex md:flex-col">
                    <input type="number" className="p-2 -mr-2 m-2 border-2 w-max rounded-lg
                  border-grey drop-shadow-lg" min="0.001" onChange={(e) => setTip(e.target.value)} />
                    <p className="p-2 -ml-2 m-2 border-2 w-max rounded-lg
                  border-grey drop-shadow-lg bg-white"> ethers</p>
                  </div>
                  <button
                    className="p-2 m-2 rounded-lg
                  bg-gradient-to-r from-green-400 to-green-500 
                  hover:from-green-600 hover:to-green-800 hover:text-white font-strong"
                    onClick={sendMessage}>
                    Buy me Muffin
                  </button>
                </div>

              </div>
            )
            :
            (
              <div className="text-center">
                <button
                  className=" p-2 m-2 rounded-lg
                  bg-gradient-to-r from-green-400 to-green-500 
                  hover:from-green-600 hover:to-green-800 hover:text-white font-strong"
                  onClick={connectWallet}>
                  Connect Wallet
                </button>
              </div>
            )
          }
        </div>

        <div className="md:grid md:grid-cols-2">
          {allMemos.slice(0).reverse().map((memo, index) => {
            return (
              <div key={index} className="border-2 rounded-t-lg p-2 m-2 hover:bg-white hover:drop-shadow-lg text-white hover:text-black">
                <div className="flex justify-between">
                  <h1 className="p-2 text-center font-medium">👋 {memo.name}</h1>
                  <h1 className="p-2 text-center font-medium">👋 {memo.message}</h1>
                </div>
                <div className="flex justify-between" title={memo.address}>
                  <div className='m-2 w-1/3 truncate'> 👤 {memo.address}</div>
                  <div className='m-2 w-1/3 truncate text-right'>🗓 {memo.timestamp.toLocaleString()}</div>
                </div>
              </div>)
          })}
        </div>
      </div>
    </div>
  );
};

export default App;