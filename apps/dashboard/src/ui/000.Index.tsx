import React from 'react';
import DebugHUD from './index/DebugHUD';

function Index() {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CLERK_AUTH_TOKEN') {
      const token = event.data.payload.token;
      alert('we have a token ' + token);
      // Store it in memory or use it for API calls!
    }
  });

  return (
    <div>
      002.react-control
      <DebugHUD />
    </div>
  );
}

export default Index;
