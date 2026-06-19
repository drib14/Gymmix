import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        style={{
          flex: 1,
          marginTop: 'var(--navbar-height)',
          marginLeft: 'var(--sidebar-width)',
          padding: '32px',
          minHeight: 'calc(100vh - var(--navbar-height))',
          transition: 'margin-left 0.3s ease',
        }}
        id="main-content"
      >
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          #main-sidebar {
            transform: translateX(${sidebarOpen ? '0' : '-100%'});
          }
          #sidebar-overlay {
            display: ${sidebarOpen ? 'block' : 'none'} !important;
          }
          #navbar-menu-toggle {
            display: flex !important;
          }
          main {
            margin-left: 0 !important;
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
