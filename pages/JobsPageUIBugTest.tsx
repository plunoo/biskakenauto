import React from 'react';

const JobsPageUIBugTest: React.FC = () => {
  console.log('🔍 Testing UI components one by one...');
  
  try {
    // Test 1: Try importing Button only
    console.log('🔍 Step 1: Testing Button import...');
    
    return (
      <div style={{padding: '20px', backgroundColor: '#ffe6e6'}}>
        <h1 style={{color: 'red', fontSize: '24px'}}>🔍 UI BUG HUNT</h1>
        <p>Testing imports step by step...</p>
        
        {/* Test basic button without UI import */}
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          margin: '10px 0'
        }}>
          Basic HTML Button (should work)
        </button>
        
        <div style={{fontSize: '14px', color: '#666', marginTop: '20px'}}>
          If you see this, basic React works. Next: test UI imports.
        </div>
      </div>
    );
  } catch (error) {
    console.error('🔍 Basic test error:', error);
    return (
      <div style={{padding: '20px', backgroundColor: '#ffebee'}}>
        <h1 style={{color: 'red'}}>❌ BASIC TEST ERROR</h1>
        <p>Error: {String(error)}</p>
      </div>
    );
  }
};

export default JobsPageUIBugTest;