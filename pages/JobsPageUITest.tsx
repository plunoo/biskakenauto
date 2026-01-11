import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { useStore } from '../store/useStore';

const JobsPageUITest: React.FC = () => {
  console.log('🎨 JobsPageUITest: Testing UI components...');
  
  try {
    const { jobs } = useStore();
    
    return (
      <div style={{padding: '20px'}}>
        <h1 style={{color: 'purple', fontSize: '24px', marginBottom: '20px'}}>🎨 UI COMPONENTS TEST</h1>
        
        {/* Test Button */}
        <div style={{marginBottom: '20px'}}>
          <h3>Testing Button:</h3>
          <Button>Test Button</Button>
        </div>
        
        {/* Test Badge */}
        <div style={{marginBottom: '20px'}}>
          <h3>Testing Badge:</h3>
          <Badge variant="success">Success Badge</Badge>
          <Badge variant="warning">Warning Badge</Badge>
        </div>
        
        {/* Test Card */}
        <div style={{marginBottom: '20px'}}>
          <h3>Testing Card:</h3>
          <Card title="Test Card">
            <p>This is card content</p>
          </Card>
        </div>
        
        <div style={{fontSize: '14px', color: '#666', marginTop: '20px'}}>
          Jobs from store: {jobs?.length || 0}
        </div>
      </div>
    );
  } catch (error) {
    console.error('🎨 JobsPageUITest: UI component error:', error);
    return (
      <div style={{padding: '20px', backgroundColor: '#ffebee', border: '2px solid red'}}>
        <h1 style={{color: 'red'}}>❌ UI COMPONENT ERROR</h1>
        <p>Error: {String(error)}</p>
        <pre>{error instanceof Error ? error.stack : 'Unknown error'}</pre>
      </div>
    );
  }
};

export default JobsPageUITest;