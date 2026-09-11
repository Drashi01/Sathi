import React from 'react';
import AIAssistantPanel from '../components/AIAssistantPanel';

export default function AIAssistantPage({ strategy, seed }) {
  return (
    <div className="max-w-4xl mx-auto py-4 h-[650px]">
      <AIAssistantPanel strategy={strategy} seed={seed} />
    </div>
  );
}
