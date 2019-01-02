pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }

//  Add a name and a symbol for your starNotary tokens
    string public name = "Star Notary Token";
    string public symbol = "SNT";
//

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

// Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo( uint256 _tokenId) public view returns (string) {
      return tokenIdToStarInfo[_tokenId].name;
    }
//

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
      }

// Add a function called exchangeStars, so 2 users can exchange their star tokens...
//Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(address user1, uint256 tokenId1, address user2, uint256 tokenId2) public {
        //require the users actually own the tokens or are approved to handle tokens
        require(ERC721._isApprovedOrOwner(user1, tokenId1) && ERC721._isApprovedOrOwner(user2, tokenId2));
        //clearApproval
        ERC721._clearApproval(user1, tokenId1);
        ERC721._clearApproval(user2, tokenId2);
        //remove tokens
        _removeTokenFrom(user1, tokenId1);
        _removeTokenFrom(user2, tokenId2);
        //add tokens
        _addTokenTo(user1, tokenId2);
        _addTokenTo(user2, tokenId1);
        //emit transfer event
        emit Transfer(user1, user2, tokenId1);
        emit Transfer(user2, user1, tokenId2);
    }


// Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
// The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
    function transferStar(address recipient, uint256 _tokenId) public {
      //Keep it DRY, use ERC721.transferFrom
      ERC721.transferFrom(msg.sender, recipient, _tokenId);
    }

}
