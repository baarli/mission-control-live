/* ============================================
   NOT IMPLEMENTED PLACEHOLDER
   ============================================ */

import React from 'react';

import { GlassCard } from '../Layout';

interface NotImplementedProps {
  section: string;
  description?: string;
}

/**
 * Placeholder shown for sections that have not yet been connected
 * to real data sources.  This makes stubbed states visible and obvious
 * rather than rendering empty lists silently.
 */
const NotImplemented: React.FC<NotImplementedProps> = ({
  section,
  description = 'This section is not yet connected to a data source.',
}) => {
  return (
    <GlassCard>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚧</div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
          {section} – Not Implemented
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>{description}</p>
      </div>
    </GlassCard>
  );
};

export default NotImplemented;
