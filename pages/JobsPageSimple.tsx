import React from 'react';

const JobsPageSimple: React.FC = () => {
  return (
    <div style={{padding: '20px', backgroundColor: 'lightblue', minHeight: '400px'}}>
      <h1 style={{color: 'darkblue', fontSize: '28px', marginBottom: '20px'}}>
        🔧 Simple Jobs Page Test
      </h1>
      
      <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
        <h2>Repair Jobs Management</h2>
        <p>This is a simplified version of the jobs page to test basic rendering.</p>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ccc'}}>
          <h3 style={{color: 'green'}}>✅ Job #001</h3>
          <p>Oil Change - Toyota Camry</p>
          <span style={{backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
            PENDING
          </span>
        </div>
        
        <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ccc'}}>
          <h3 style={{color: 'blue'}}>🔄 Job #002</h3>
          <p>Brake Repair - Honda Civic</p>
          <span style={{backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
            IN PROGRESS
          </span>
        </div>
      </div>
      
      <button style={{
        marginTop: '20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px'
      }}>
        + New Job Order
      </button>
      
      <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
        If you can see this page with jobs and styling, the component works!
      </div>
    </div>
  );
};

export default JobsPageSimple;