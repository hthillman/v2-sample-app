import React, { Component } from "react";
import {Button, TextField} from '@material-ui/core';
import logo from "./logo.svg";
import "./App.css";
import * as connext from "@connext/client";
import * as types from "@connext/types";
import { store } from "./store.js";
import { ethers as eth } from "ethers";
import { AddressZero } from "ethers/constants";


const { bigNumberify, parseEther, formatEther } = eth.utils

 const toBN = (n) =>
  bigNumberify(n.toString())

 const toWei = (n) =>
  parseEther(n.toString())


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: null,
      depositAddr:null,
      counterpartyXPub:null
    };
  }

  componentDidMount = async () => {
    //localStorage.removeItem("mnemonic");
    let mnemonic = localStorage.getItem("mnemonic");
    if (!mnemonic) {
      mnemonic = eth.Wallet.createRandom().mnemonic;
      localStorage.setItem("mnemonic", mnemonic);
    }

    const options = {
      mnemonic,
      logLevel: 5,
      nodeUrl: `ws://localhost:80/api/messaging`,
      ethProviderUrl: `http://localhost:80/api/ethprovider`,
      store
    };

    const channel = await connext.connect(options);

    console.log(channel)

    if (channel) {
      const xPub = channel.publicIdentifier;
      console.log(`XPUB ${xPub}`)
      const depositAddr = connext.utils.publicIdentifierToAddress(xPub);
      console.log(`DEPOSIT ADDRESS DERIVED FROM XPUB ${depositAddr}`)
      this.setState({channel, depositAddr});
    }
  };

  deposit = async(amount) =>{
    const amountBN = toBN(amount);
    const payload = {
      amount:amountBN,
      assetId: AddressZero
    }

    await this.state.channel.deposit(payload)

  }

  pay = async(amount) =>{

    const amountBN = toBN(amount);

    // const {counterpartyXPub} = this.state;
    // console.log("counterparty ",counterpartyXPub)

    const payload = { 
      recipient: "xpub6DY3unceAR2aRyrserzosndQc8nhXkRrfQntg64CSQw1fGjpTeEG32G4e2uji4811eJCFu62iZnCoTLp5XJsr2pvHYSoCGnT5CVRDFoWSUZ",
      meta: "Metadata for transfer",
      amount: amountBN, // in Wei
      assetId: AddressZero // represents ETH
    }

    console.log(JSON.stringify(payload))

    await this.state.channel.transfer(payload)

  }

  render() {
    const { channel } = this.state;
    return (
      <div className="App">
        <div>
        <Button variant="contained" onClick={() =>this.deposit(10)}>Deposit 10</Button>
        </div>
        <div>
          
        <Button variant="contained" disabled={true} onClick={() =>this.deposit(10)}>Swap 10</Button>
        </div>
        <div>
        <TextField placeholder="counterparty xPub" onChange={(evt)=> this.setState({counterpartyXPub:evt.target.val})}/>
        <Button variant="contained" onClick={() =>this.pay(10)}>Pay 10</Button>
        </div>
        <div>
        <Button variant="contained" onClick={() =>this.deposit(10)}>Withdraw 10</Button>
        </div>
      </div>
    );
  }
}

export default App;
