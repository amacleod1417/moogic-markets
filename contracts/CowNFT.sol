// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";    
import "./interfaces/IBeraborrow.sol";

contract CowNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public cowToVault;
    mapping(uint256 => string) public cowMetadataCID;

    IBeraborrow public beraborrow;

    constructor(address _beraborrow) ERC721("Moogic Cow", "COW") Ownable(msg.sender) {
        beraborrow = IBeraborrow(_beraborrow);
    }

    function mintCow(address to, string memory cid) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        cowMetadataCID[tokenId] = cid;
        // Create vault and bind it to cow NFT
        uint256 vaultId = beraborrow.createVault(to);
        cowToVault[tokenId] = vaultId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return string(abi.encodePacked("https://ipfs.filebase.io/ipfs/", cowMetadataCID[tokenId]));
}

}
