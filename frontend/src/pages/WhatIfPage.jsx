import React from 'react';
import WhatIfPanel from '../components/WhatIfPanel';

export default function WhatIfPage({ incidents, vehicles, seed }) {
  return (
    <div className="max-w-6xl mx-auto py-4">
      <WhatIfPanel incidents={incidents} vehicles={vehicles} seed={seed} />
    </div>
  );
}
