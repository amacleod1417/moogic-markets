"use client"; // if using Next.js 13+

import React from "react";
import { useState } from "react";
import { getMoogicMarketContract } from "../lib/contract";

export default function TestConnectionButton() {
  const [owner, setOwner] = useState<string>("");

  const handleClick = async () => {
    try {
      const contract = await getMoogicMarketContract();
      const ownerAddress = await contract.owner();
      setOwner(ownerAddress);
      console.log("Contract owner:", ownerAddress);
    } catch (error) {
      console.error("Error fetching owner:", error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <button onClick={handleClick} className="px-4 py-2 bg-blue-500 text-white rounded">
        Get Contract Owner
      </button>
      {owner && <p className="mt-2">Owner: {owner}</p>}
    </div>
  );
}
