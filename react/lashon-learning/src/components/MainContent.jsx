import React from 'react';
import TextHeader from './TextHeader';
import Sidebar from './Sidebar';
import Verse from './Verse'

export default function MainContent() {
  return (
    <div>
      <Sidebar />
      <TextHeader />
        <div>
            <Verse />
        </div>
    </div>
  );
}
