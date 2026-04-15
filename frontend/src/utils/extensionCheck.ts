// Utilitário para detectar e gerenciar conflitos com extensões do navegador

export const detectBrowserExtensions = () => {
  console.log('=== CHECKING BROWSER EXTENSIONS ===');
  
  const issues = [];
  
  // Verificar MetaMask
  if (typeof window !== 'undefined') {
    const hasMetaMask = !!(window as any).ethereum || !!(window as any).web3;
    if (hasMetaMask) {
      issues.push({
        type: 'crypto_wallet',
        name: 'MetaMask',
        solution: 'Desative temporariamente o MetaMask durante o login'
      });
    }
    
    // Verificar outras extensões de Web3
    const hasWeb3 = !!(window as any).web3 || !!(window as any).ethereum;
    if (hasWeb3) {
      issues.push({
        type: 'web3_extension',
        name: 'Web3 Extension',
        solution: 'Desative extensões de Web3 durante o login'
      });
    }
    
    // Verificar ad blockers
    let hasAdBlocker = false;
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && script.src.includes('adblock')) {
        hasAdBlocker = true;
      }
    });
    
    if (hasAdBlocker) {
      issues.push({
        type: 'adblocker',
        name: 'Ad Blocker',
        solution: 'Desative ad blockers para este site'
      });
    }
  }
  
  return {
    hasIssues: issues.length > 0,
    issues,
    message: issues.length > 0 
      ? `Detectados conflitos: ${issues.map(i => i.name).join(', ')}`
      : 'Nenhum conflito detectado'
  };
};

export const showExtensionWarning = () => {
  const check = detectBrowserExtensions();
  
  if (check.hasIssues) {
    console.warn('EXTENSION CONFLICTS DETECTED:', check.issues);
    
    // Criar modal de aviso
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          max-width: 500px;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
        ">
          <h2 style="margin: 0 0 1rem 0; color: #dc2626;">⚠️ Conflito Detectado</h2>
          <p style="margin: 0 0 1rem 0; color: #6b7280;">
            Detectamos extensões que podem interferir no login:
          </p>
          <ul style="margin: 0 0 1rem 0; padding-left: 1rem; color: #374151;">
            ${check.issues.map(issue => 
              `<li style="margin: 0.5rem 0;"><strong>${issue.name}:</strong> ${issue.solution}</li>`
            ).join('')}
          </ul>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button onclick="this.closest('div').remove()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            ">
              Entendi, vou desativar
            </button>
            <button onclick="window.location.reload()" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            ">
              Tentar assim mesmo
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove após 10 segundos
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 10000);
  }
};
