//import 'babel-polyfill';

const StarNotary = artifacts.require('./StarNotary.sol');

let instance;
var owner;

contract('StarNotary', (accs) => {
	  owner = accs[0];

  	beforeEach(async function () {
  			instance = await StarNotary.new({from: owner});
  	})

    it('can Create a Star', async() => {
      let tokenId = 1;
      await instance.createStar('Awesome Star!', tokenId, {from: owner});
      assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
    });

    it('lets user1 put up their star for sale', async() => {
      let user1 = accs[1];
      let starId = 2;
      let starPrice = web3.toWei('.01', "ether");
      //no need to use .call since these are all txs
      await instance.createStar('awesome star', starId, {from: user1});
      await instance.putStarUpForSale(starId, starPrice, {from: user1});
      //call the public mapping
      assert.equal(await instance.starsForSale.call(starId), starPrice);
    });

    it('lets user1 get the funds after the sale', async() => {
      let user1 = accs[1];
      let user2 = accs[2];
      let starId = 3;
      let starPrice = web3.toWei('.01', "ether");
      await instance.createStar('awesome star', starId, {from: user1});
      await instance.putStarUpForSale(starId, starPrice, {from: user1});
      let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
      //buyStar is a payable function, so ether must be passed
      //for future reference, gas key is also passed here
      await instance.buyStar(starId, {from: user2, value: starPrice});
      let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
      //console.log(balanceOfUser1AfterTransaction);
      assert.equal(parseInt(balanceOfUser1BeforeTransaction) + parseInt(starPrice), parseInt(balanceOfUser1AfterTransaction));
    });

    it('lets user2 buy a star, if it is put up for sale', async() => {
      let user1 = accs[1];
      let user2 = accs[2];
      let starId = 4;
      let starPrice = web3.toWei('.01', "ether");
      await instance.createStar('awesome star', starId, {from: user1})
      await instance.putStarUpForSale(starId, starPrice, {from: user1})
      let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
      await instance.buyStar(starId, {from: user2, value: starPrice});
      assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lets user2 buy a star and decreases its balance in ether', async() => {
      let user1 = accs[1];
      let user2 = accs[2];
      let starId = 5;
      let starPrice = web3.toWei('.01', "ether");
      await instance.createStar('awesome star', starId, {from: user1});
      await instance.putStarUpForSale(starId, starPrice, {from: user1});
      const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
      //no gas because we are testing balance
      await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0});
      const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
      assert.equal(parseInt(balanceOfUser2BeforeTransaction) - parseInt(balanceAfterUser2BuysStar), parseInt(starPrice));
    });

    // Write Tests for:
    // 1) The token name and token symbol are added properly.
    describe('has token name and symbol', () => {
  		//test to make token name is correct
  		it('has correct token name', async () => {
        assert.equal(await instance.name.call(), 'Star Notary Token');
  		});

      //test to make token symbol is correct
  		it('has correct token symbol', async () => {
        assert.equal(await instance.symbol.call(), 'SNT');
  		});
  	});

    // 2) 2 users can exchange their stars.
    describe('2 users can exchange their stars', async () => {
      let user1 = accs[1];
      let user2 = accs[2];
      let firstStarID = 1;
      let secondStarID = 2;

      beforeEach(async function () {
        //create the stars from both users.
        await instance.createStar('awesome star 1', firstStarID, {from: user1});
        await instance.createStar('awesome star 2', secondStarID, {from: user2});
      })

      //user1 owns star before exchange
      it('user1 owns star before exchange', async () => {
        assert.equal(await instance.ownerOf.call(firstStarID), user1);
      });
      //user2 owns star before exchange
      it('user2 owns star before exchange', async () => {
        assert.equal(await instance.ownerOf.call(secondStarID), user2);
      });
  		//test to see if 2 users can exchange stars
  		it('user1 and user2 can exchange stars', async () => {
        //exchange the stars
        await instance.exchangeStars(user1, firstStarID, user2, secondStarID, {from: user1, gasPrice:0});
        assert.equal(await instance.ownerOf.call(secondStarID), user1);
        assert.equal(await instance.ownerOf.call(firstStarID), user2);
  		});
  	});

    // 3) Stars Tokens can be transferred from one address to another.
    describe('star tokens can be transferred from one address to another', async () => {
      let user1 = accs[1];
      let user2 = accs[2];
      let starID = 1;

      beforeEach(async function () {
        //create the star from user1
        await instance.createStar('Cool Star', starID, {from: user1});
      });

      //test to see if star token was transferred.
  		it('check if star token was transferred', async () => {
        //transfer the token to user2
        await instance.transferStar(user2, starID, {from: user1, gasPrice:0});
        assert.equal(await instance.ownerOf.call(starID), user2);
      });
  	});

})
