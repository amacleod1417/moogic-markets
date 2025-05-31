import React from 'react';
import TestConnectionButton from "../components/TestConnectionButton";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">MoogicMarkets Frontend</h1>
      <TestConnectionButton />
    </main>
  );
}