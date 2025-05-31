import * as React from "react"
import Link from "next/link"
import { MilkIcon as Cow, Twitter, Github, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Cow className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Moogic Markets
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The world's first decentralized prediction market for granular agricultural outcomes. Bet on Bessie, hedge
              your crops, research climate patterns.
            </p>
            <div className="flex space-x-3">
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <MessageCircle className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Markets</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  🐄 Livestock Events
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🌽 Crop Yields
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🌧️ Weather Patterns
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🐐 Farm Shenanigans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  🚜 Farmers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🛡️ Insurance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🔬 Researchers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  ⚡ Degens
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white">
                  📖 Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  🔗 Smart Contracts
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  📊 Oracle Data
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  💬 Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Moogic Markets. Built with 🐄 and ❤️ for the agricultural DeFi revolution.</p>
          <p className="mt-2 text-xs">Not financial advice. Please bet responsibly on farm animals.</p>
        </div>
      </div>
    </footer>
  )
}
