// Redirect to homepage when the page was loaded via browser reload/refresh
(function(){
  try{
    // prune old purchases: keep only purchases for the most recently purchased character
    try{
      const purchasesRaw = localStorage.getItem('purchases');
      if (purchasesRaw){
        // sanitize purchases first: remove entries that are not objects or have no valid house/char/pet
        try{
          const parsed = JSON.parse(purchasesRaw||'[]');
          if (Array.isArray(parsed)){
            const cleaned = parsed.filter(p => {
              if (!p || typeof p !== 'object') return false;
              // keep purchase if it has accessory items with valid filenames
              if (Array.isArray(p.items) && p.items.some(it => it && it.filename && String(it.filename).trim() !== '' && String(it.filename) !== 'undefined')) return true;
              // or if it has house/char/pet metadata
              const keys = ['house','char','pet'];
              return keys.some(k => {
                const v = p[k];
                return v !== undefined && v !== null && String(v).trim() !== '' && String(v) !== 'undefined';
              });
            });
            if (cleaned.length !== parsed.length){
              localStorage.setItem('purchases', JSON.stringify(cleaned));
            }
          }
        }catch(e){ /* ignore parse errors */ }

        // no additional pruning here — keep accessory purchases even when they lack char/house fields
        // ensure purchases array exists and remains as sanitized above
        try{
          const current = JSON.parse(localStorage.getItem('purchases')||'[]');
          if (!Array.isArray(current)) localStorage.setItem('purchases', JSON.stringify([]));
        }catch(e){ localStorage.setItem('purchases', JSON.stringify([])); }
      }
    }catch(e){ /* ignore parse errors */ }

    // don't redirect if already on index
    const path = window.location.pathname.split('/').pop();
    if (!path || path === '' || path === 'index.html') return;
    let isReload = false;
    if (performance.getEntriesByType){
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) isReload = nav.type === 'reload';
    }
    if (!isReload && performance.navigation){
      // legacy
      isReload = performance.navigation.type === 1;
    }
    if (isReload){
      try{ localStorage.setItem('earned', '0'); }catch(e){}
      window.location.href = 'index.html';
    }
    // schedule periodic purge of saved purchases so accessories must be re-earned
    try{
      const PURGE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
      function purgePurchases(){
        try{
          const cutoff = Date.now() - PURGE_INTERVAL;
          // keep only purchases newer than cutoff (by .time)
          try{
            const raw = localStorage.getItem('purchases');
            if (raw){
              const arr = JSON.parse(raw||'[]');
              if (Array.isArray(arr)){
                const kept = arr.filter(it => {
                  if (!it || typeof it !== 'object') return false;
                  const t = Number(it.time) || 0;
                  return t >= cutoff;
                });
                localStorage.setItem('purchases', JSON.stringify(kept));
              }
            }
          }catch(e){ /* ignore parse errors */ }

          // remove pendingPurchase if it's old or invalid
          try{
            const pend = localStorage.getItem('pendingPurchase');
            if (pend){
              const p = JSON.parse(pend);
              const t = Number(p && p.time) || 0;
              if (!t || t < cutoff) localStorage.removeItem('pendingPurchase');
            }
          }catch(e){ localStorage.removeItem('pendingPurchase'); }

          // reset earned balance when purging
          try{ localStorage.setItem('earned','0'); }catch(e){}
          // record last purge time
          localStorage.setItem('lastPurge', String(Date.now()));
        }catch(e){}
      }
      // if last purge was long ago, purge now
      try{
        const last = parseInt(localStorage.getItem('lastPurge')||'0',10) || 0;
        // only purge now if we've purged before and the period has elapsed.
        // don't perform a purge on first-ever load (last===0) to avoid immediate deletion.
        if (last && (Date.now() - last) > PURGE_INTERVAL){ purgePurchases(); }
      }catch(e){}
      // schedule recurring purge while page is open
      setInterval(purgePurchases, PURGE_INTERVAL);
    }catch(e){}
  }catch(e){ /* ignore errors */ }
})();
