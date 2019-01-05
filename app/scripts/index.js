// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import StarNotaryArtifact from '../../build/contracts/StarNotary.json'

// StarNotary is our usable abstraction, which we'll use through the code below.
const StarNotary = contract(StarNotaryArtifact);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts;
let account;
let instance;

const App = {
  start: function () {
    const self = this

    // Bootstrap the MetaCoin abstraction for Use.
    StarNotary.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(async function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs
      account = accounts[0]
      instance = await StarNotary.deployed();

    })
  },

  setStatus: function (message, element) {
    const status = document.getElementById(element)
    status.innerHTML = message
  },

  createStar: async function () {
    const statusElement = document.getElementById("status");
    statusElement.classList.remove("missing");
    App.setStatus("", 'status');
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    if (!name || !id) {
      statusElement.classList.add("missing");
      App.setStatus("Please enter a name and id for your star!", 'status');
      return;
    }
    await instance.createStar(name, id, {from: account});
    App.setStatus("New Star Owner is " + account + ".", 'status');
  },
  // Add a function lookUp to Lookup a star by ID using tokenIdToStarInfo()
  lookUpStar: async function () {
    App.setStatus("", 'nameOfStar');
    App.setStatus("",  'starOwner');
    const tokenId = document.getElementById("tokenId").value;
    const starName = await instance.lookUptokenIdToStarInfo(tokenId, {from: account});
    const starOwner = await instance.ownerOf(tokenId, {from: account});
    if (starOwner === '0x') {
      App.setStatus("This star doesn't exist yet, Go claim it!", 'nameOfStar');
    } else {
      App.setStatus("Star name is: " + starName, 'nameOfStar');
      App.setStatus("Star owner is: " + starOwner, 'starOwner');
    }
  },
  // transfer star using transferStar method on our smart contract
  transferStar: async function () {
    const sendStatusElement = document.getElementById("sendStatus");
    sendStatusElement.classList.remove("missing");
    App.setStatus("",'sendStatus');
    const transferId = document.getElementById("transferId").value;
    const to = document.getElementById("to").value;
    if (!transferId || !to) {
      sendStatusElement.classList.add("missing");
      App.setStatus("Please enter a recipient address and the id of the star!",'sendStatus');
      return;
    }
    const transfer = await instance.transferStar(to, transferId, {from: account});
    App.setStatus("Star was sent to " + to + '. Please wait for miners to confirm the transaction.','sendStatus');
    console.log(transfer);
  }

}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:9545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})
