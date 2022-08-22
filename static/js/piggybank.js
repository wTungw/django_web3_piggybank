
const rpcURL = "https://kovan.infura.io/v3/998b75ac3dc44270b7826686f6684bec"

const web3 = new Web3(rpcURL)

// const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getMyBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwnerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSenderAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"goal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"want","type":"uint256"}],"name":"takeMoney","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const accountFrom = {
    name: 'Owner',
    address: '0xA2cEc1aC87A2f6c44C950ed598dC1feEbEe67F4E',
    privateKey: '0x759940301e3e5b2656637a22ab7d78ec0cf656690862fe7d337bd5eafc2a4e91'
}

const accountUser = {
    name: 'none',
    address:    'none',
    privateKey: 'none'
}

var abi;
var contract_address;

$.getJSON("/static/json/contract_info.json", function(data){
    abi = data['abi']
    contract_address = data['address']
    init()
})
// window.onload = init()
// init()

function init(){ 

    // const contract_address = document.getElementById("contract_address").innerText  
    // const contract_address = "0xCE093f364aD89fbAE727eB66CE58152a94b85A07"
    // document.getElementById("contract_address").innerHTML += contract_address;
    document.getElementById("contract_address").innerHTML = contract_address;
    document.getElementById("contract_address").href = "https://kovan.etherscan.io/address/" + contract_address;
    contract_instance = new web3.eth.Contract(abi, contract_address);
    
    contract_instance.methods.goal().call((err,result) => {
        if(err){
            document.getElementById("goal").innerHTML = "Contract doesn't exist!"
        }
        else{
            document.getElementById("goal").innerHTML = result
        }
    })
    get_balance()
}

function get_account(object) {
    accountUser.name = object
    switch (object) {
        case "Owner":
            accountUser.address = '0xA2cEc1aC87A2f6c44C950ed598dC1feEbEe67F4E'
            accountUser.privateKey = '0x759940301e3e5b2656637a22ab7d78ec0cf656690862fe7d337bd5eafc2a4e91'
            break;
        case "User1":
            accountUser.address = '0xC8Ba38fe978873DD1164812a91a452C9b31D9544'
            accountUser.privateKey = '0xaac4c4fd04a6104b8101c446ee6378c7d17fd5832a5104dc59823151891db1c8'
            break;
        case "User2":
            accountUser.address = '0xBe99B79eC36207E812AeE62D32b0fc71Cccf88C9'
            accountUser.privateKey = '0x9f7a6808efe202943353a9221abf3a14e94431d654734894483e3cd66544da3d'
            break;
        default:
            accountUser.name = 'none'
            accountUser.address = 'none'
            accountUser.privateKey = 'none'
            break;
    }
    console.log("address: " + accountUser.address + " is using Piggy Bank")
}


function get_balance() {
    contract_instance.methods.getMyBalance().call((err,result) => {
        if(err)
            document.getElementById("balance").innerHTML = "Contract doesn't exist!"
        else{
            document.getElementById("balance").innerHTML = result
        }
    })
}

const take_money = async() => {
    if( accountUser.address != 'none' && document.getElementById("take_value").value != ''){
        document.getElementById("take_error").innerHTML = ""
        _value = web3.utils.toWei(document.getElementById("take_value").value, "wei");
        console.log("attempting to take", _value, "wei to address", accountUser.address);
        takeMoneyTx = contract_instance.methods.takeMoney(_value);
        
        // Sign Tx with PK
        const createTransaction = await web3.eth.accounts.signTransaction(
            {
                from: accountUser.address,
                to: contract_address,
                data: takeMoneyTx.encodeABI(),
                gas : 210000,
            },
            accountUser.privateKey
        );

        // Send Tx and Wait for Receipt
        try{
            const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
            document.getElementById("take_error").innerHTML = 'Hash: '+createReceipt.transactionHash
            document.getElementById("take_error").style.color = 'black'
        }
        catch(error){
            console.error(error);
            document.getElementById("take_error").innerHTML = "Check if you're the owner or not, or maybe the money is not enough!"
        }
        get_balance()
    }
    else if(accountUser.address != 'none'){
        document.getElementById("take_error").innerHTML = "Please enter the amount that you want to take!"
    }
    else{
        document.getElementById("take_error").innerHTML = "Choose your account first!"
    }
}

const withdraw = async() => {
    if(accountUser.name == accountFrom.name){
        document.getElementById("withdraw_error").innerHTML = ""
        console.log("attempting to withdraw by address:", accountFrom.address);
        withdrawTx = contract_instance.methods.withdraw();
    
        const createTransaction = await web3.eth.accounts.signTransaction(
            {
                from: accountFrom.address,
                to: contract_address,
                data: withdrawTx.encodeABI(),
                gas: 210000,
            },
            accountFrom.privateKey
        );
    
        // Send Tx and Wait for Receipt
        const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
        // console.log('Tx successful with hash:'+createReceipt.transactionHash);
        document.getElementById("withdraw_error").innerHTML = 'Hash: ' + createReceipt.transactionHash
        document.getElementById("withdraw_error").style.color = "black"
        get_balance()
    }
    else{
        document.getElementById("withdraw_error").innerHTML = "Sorry, you do not have permission to do this."
    }
}

const save_money = async() => {
    
    var value = document.getElementById("save_value").value
    if(accountUser.address != 'none' && value != ''){
        document.getElementById("save_error").innerHTML = ""
        console.log("attempting to save " + value + " by address:" + accountUser.address)
        
        const txObject = {
            from:       accountUser.address,
            to:         contract_address,
            value:      web3.utils.toHex(web3.utils.toWei(value, 'wei')),
            gasLimit:   web3.utils.toHex(210000),
            gasPrice:   web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
            data:       "0x"
        }

        const createTransaction = await web3.eth.accounts.signTransaction(txObject, accountUser.privateKey)

        const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
        console.log('Tx successful with hash:'+createReceipt.transactionHash)
        document.getElementById("save_error").innerHTML = 'Hash: ' + createReceipt.transactionHash
        document.getElementById("save_error").style.color = "black"
        get_balance()
    }
    else if(accountUser.address != 'none'){
        document.getElementById("save_error").innerHTML = "Please enter the amount that you want to save!"
    }
    else{
        document.getElementById("save_error").innerHTML = "Choose your account first!"
    }
}
