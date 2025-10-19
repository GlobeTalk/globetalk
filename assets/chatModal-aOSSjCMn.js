function a({title:n,content:o,onConfirm:t,onCancel:d,confirmText:l="Confirm",cancelText:i="Cancel"}){let e=document.getElementById("flag-modal");e&&e.remove(),e=document.createElement("div"),e.id="flag-modal",e.style.position="fixed",e.style.top=0,e.style.left=0,e.style.width="100vw",e.style.height="100vh",e.style.background="rgba(0,0,0,0.3)",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.zIndex=1e4,e.innerHTML=`
    <div style="background:#fff;padding:24px 20px;border-radius:10px;max-width:350px;width:100%;box-shadow:0 2px 16px rgba(0,0,0,0.15);">
      <h2 style="margin-top:0;font-size:1.2em;">${n}</h2>
      <div style="margin-bottom:16px;">${o}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button id="flag-cancel-btn" style="padding:7px 18px;background:#e5e7eb;border:none;border-radius:5px;">${i}</button>
        <button id="flag-confirm-btn" style="padding:7px 18px;background:#ef4444;color:#fff;border:none;border-radius:5px;">${l}</button>
      </div>
    </div>
  `,document.body.appendChild(e),document.getElementById("flag-cancel-btn").onclick=()=>{e.remove(),d&&d()},document.getElementById("flag-confirm-btn").onclick=()=>{t&&t(),e.remove()}}export{a as showModal};
