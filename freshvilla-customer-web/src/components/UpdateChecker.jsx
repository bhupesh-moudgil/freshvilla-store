import { useEffect } from 'react';

const UpdateChecker = () => {
  useEffect(() => {
    // Version check interval (every 5 minutes)
    const CHECK_INTERVAL = 5 * 60 * 1000;
    
    // Store current version in localStorage
    const CURRENT_VERSION = process.env.REACT_APP_VERSION || '1.0.0';
    const LAST_VERSION_KEY = 'app_version';
    
    const checkForUpdates = async () => {
      try {
        // Add cache-busting timestamp
        const timestamp = new Date().getTime();
        const response = await fetch(`/version.json?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const serverVersion = data.version;
          const lastVersion = localStorage.getItem(LAST_VERSION_KEY);
          
          // If version changed or first time
          if (lastVersion && lastVersion !== serverVersion) {
            showUpdateNotification(serverVersion);
          }
          
          // Update stored version
          localStorage.setItem(LAST_VERSION_KEY, serverVersion);
        }
      } catch (error) {
        console.log('Update check failed:', error);
      }
    };
    
    const showUpdateNotification = (newVersion) => {
      // Create notification element
      const notification = document.createElement('div');
      notification.id = 'update-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0b6bcb 0%, #0c5da5 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        animation: slideInRight 0.4s ease-out;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="font-size: 28px;">🔄</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">
              New Update Available!
            </div>
            <div style="font-size: 13px; opacity: 0.95; margin-bottom: 12px;">
              Version ${newVersion} is ready. Refresh to get the latest features and fixes.
            </div>
            <button id="update-now-btn" style="
              background: white;
              color: #0b6bcb;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              margin-right: 8px;
              transition: transform 0.2s;
            ">
              Update Now
            </button>
            <button id="update-later-btn" style="
              background: transparent;
              color: white;
              border: 1px solid rgba(255,255,255,0.5);
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            ">
              Later
            </button>
          </div>
        </div>
      `;
      
      // Add animation styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        #update-now-btn:hover {
          transform: scale(1.05);
        }
        #update-later-btn:hover {
          background: rgba(255,255,255,0.1);
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Update Now button
      document.getElementById('update-now-btn').addEventListener('click', () => {
        // Clear all caches and force reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Clear localStorage except auth data
        const authData = {
          admin_token: localStorage.getItem('admin_token'),
          admin_user: localStorage.getItem('admin_user'),
          customer_token: localStorage.getItem('customer_token'),
          customer_user: localStorage.getItem('customer_user')
        };
        
        localStorage.clear();
        
        // Restore auth data
        Object.entries(authData).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value);
        });
        
        // Hard reload
        window.location.reload(true);
      });
      
      // Later button
      document.getElementById('update-later-btn').addEventListener('click', () => {
        notification.remove();
      });
    };
    
    // Check immediately on mount
    checkForUpdates();
    
    // Check periodically
    const interval = setInterval(checkForUpdates, CHECK_INTERVAL);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);
  
  return null;
};

export default UpdateChecker;
