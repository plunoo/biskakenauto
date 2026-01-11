import React from 'react';
import { useStore } from '../store/useStore';

const JobsPageTest: React.FC = () => {
  console.log('🧪 JobsPageTest: Starting render...');
  
  try {
    const { jobs, customers } = useStore();
    console.log('🧪 JobsPageTest: Store data loaded', { 
      jobsCount: jobs?.length || 0, 
      customersCount: customers?.length || 0 
    });
    
    return (
      <div style={{padding: '20px', backgroundColor: '#fff3cd', border: '2px solid orange'}}>
        <h1 style={{color: 'orange', fontSize: '24px'}}>🧪 STORE TEST - JobsPage</h1>
        <div style={{marginTop: '20px'}}>
          <p><strong>Jobs:</strong> {jobs?.length || 0} items</p>
          <p><strong>Customers:</strong> {customers?.length || 0} items</p>
        </div>
        <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
          If you see this with job/customer counts, the store works!
        </div>
      </div>
    );
  } catch (error) {
    console.error('🧪 JobsPageTest: Store error:', error);
    return (
      <div style={{padding: '20px', backgroundColor: '#ffebee', border: '2px solid red'}}>
        <h1 style={{color: 'red'}}>❌ STORE ERROR</h1>
        <p>Error: {String(error)}</p>
      </div>
    );
  }
};

export default JobsPageTest;