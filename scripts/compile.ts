import * as fs from 'fs'
import * as path from 'path'

async function main() {
    // Create artifacts directory if it doesn't exist
    const artifactsDir = path.join(__dirname, '../src/artifacts')
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true })
    }

    // Copy CowNFT artifacts
    const cowNFTArtifact = require('../artifacts/contracts/CowNFT.sol/CowNFT.json')
    fs.writeFileSync(
        path.join(artifactsDir, 'CowNFT.json'),
        JSON.stringify(cowNFTArtifact, null, 2)
    )

    console.log('Contract artifacts generated successfully!')
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
}) 