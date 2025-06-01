import { Web3Storage, File } from "web3.storage";
import fs from "fs";
import path from "path";

const API_TOKEN = "c1451f51.3251a54da582472abb4c1513e0422c97"; 

function getFiles() {
  const imagePath = path.join(__dirname, "bessie.png");
  const imageBuffer = fs.readFileSync(imagePath);
  const imageFile = new File([imageBuffer], "bessie.png", { type: "image/png" });

  const metadata = {
    name: "Bessie",
    description: "A Flare-powered betting cow NFT from CowDAO",
    image: "bessie.png", // will be replaced by IPFS link
    attributes: [
      { trait_type: "Breed", value: "Holstein" },
      { trait_type: "Milk Output", value: "20 gal/day" },
      { trait_type: "Temperament", value: "Calm" },
    ],
  };

  const metadataFile = new File(
    [Buffer.from(JSON.stringify(metadata))],
    "metadata.json",
    { type: "application/json" }
  );

  return [imageFile, metadataFile];
}

async function store() {
  const client = new Web3Storage({ token: API_TOKEN });
  const files = getFiles();
  const cid = await client.put(files);
  console.log(" Stored to IPFS with CID:", cid);
  console.log(`metadata.json: https://${cid}.ipfs.w3s.link/metadata.json`);
}

store();
