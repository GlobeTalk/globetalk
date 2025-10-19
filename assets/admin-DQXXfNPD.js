var W=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);import"./modulepreload-polyfill-B5Qt9EMX.js";import{u as G,b as Z,g as K,c as J,d as Q,e as ee,f as te,h as re,j as ne}from"./admin-CP7GV2WY.js";import{l as oe,b as se,a as L}from"./firebase-BrtCog--.js";var ge=W((ve,_)=>{const R={DEBOUNCE_DELAY:300,MAX_RETRIES:3,RETRY_DELAY:1e3,MODAL_Z_INDEX:9999,LOADING_TIMEOUT:1e4,DATE_FORMAT:{timeZone:"Africa/Johannesburg",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}};class X{constructor(){this.currentView="unresolved",this.isLoading=!1,this.error=null,this.counts={active:0,reported:0,banned:0},this.reports=[],this.bannedUsers=[],this.listeners=new Map}setState(e,t){this[e]=t,this.notifyListeners(e,t)}subscribe(e,t){this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t)}unsubscribe(e,t){const s=this.listeners.get(e);s&&s.delete(t)}notifyListeners(e,t){const s=this.listeners.get(e);s&&s.forEach(n=>{try{n(t)}catch(o){console.error(`Error in listener for ${e}:`,o)}})}}const D=new X;class l{static log(e,t,s=null){const n=new Date().toISOString(),o=s?{message:t,data:s,timestamp:n}:{message:t,timestamp:n};switch(e){case"error":console.error(`[${n}] ERROR:`,o);break;case"warn":console.warn(`[${n}] WARN:`,o);break;case"info":console.info(`[${n}] INFO:`,o);break;default:console.log(`[${n}] LOG:`,o)}}static error(e,t){this.log("error",e,t)}static warn(e,t){this.log("warn",e,t)}static info(e,t){this.log("info",e,t)}}function ae(r,e){let t;return function(...s){clearTimeout(t),t=setTimeout(()=>r.apply(this,s),e)}}async function I(r,e=R.MAX_RETRIES){let t;for(let s=1;s<=e;s++)try{return await r()}catch(n){if(t=n,l.warn(`Attempt ${s} failed:`,n.message),s<e){const o=R.RETRY_DELAY*s;await new Promise(a=>setTimeout(a,o))}}throw t}function c(r){return typeof r!="string"?"":r.trim().replace(/<[^>]*>/g,"")}function S(r){return r&&typeof r=="string"&&r.trim().length>0}function ie(r){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)}class E extends Error{constructor(e,t="UNKNOWN_ERROR",s=null){super(e),this.name="AppError",this.code=t,this.details=s,this.timestamp=new Date().toISOString()}}function B(r,e="Unknown"){l.error(`Error in ${e}:`,{message:r.message,stack:r.stack,code:r.code||"UNKNOWN"});const t=Y(r);A(t,"error")}function Y(r){return{PERMISSION_DENIED:"You do not have permission to perform this action.",NETWORK_ERROR:"Network connection failed. Please check your internet connection.",TIMEOUT:"Operation timed out. Please try again.",VALIDATION_ERROR:"Invalid input provided. Please check your data.",USER_NOT_FOUND:"User not found.",ALREADY_BANNED:"User is already banned.",BAN_FAILED:"Failed to ban user. Please try again.",UNBAN_FAILED:"Failed to unban user. Please try again."}[r.code]||"An unexpected error occurred. Please try again."}function A(r,e="info",t=5e3){document.querySelectorAll(".notification").forEach(a=>a.remove());const n=document.createElement("div");n.className=`notification notification-${e}`,n.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: ${R.MODAL_Z_INDEX+1};
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;const o={success:"#4caf50",error:"#f44336",warning:"#ff9800",info:"#2196f3"};n.style.background=o[e]||o.info,n.textContent=r,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translateX(0)"},10),setTimeout(()=>{n.parentNode&&(n.style.transform="translateX(100%)",setTimeout(()=>n.remove(),300))},t),n.addEventListener("click",()=>{n.style.transform="translateX(100%)",setTimeout(()=>n.remove(),300)})}function H(r,e="Loading..."){r&&(r.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;padding:3rem;color:#666;">
      <div style="
        width:40px;
        height:40px;
        border:4px solid #e0e0e0;
        border-top:4px solid #2196f3;
        border-radius:50%;
        animation:spin 1s linear infinite;
        margin-bottom:1rem;
      "></div>
      <div>${e}</div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `)}function F(r){if(!r)return"Unknown";try{let e;if(r.toDate&&typeof r.toDate=="function")e=r.toDate();else if(r instanceof Date)e=r;else if(typeof r=="string"||typeof r=="number")e=new Date(r);else return"Invalid Date";return isNaN(e.getTime())?"Invalid Date":e.toLocaleString("en-GB",R.DATE_FORMAT)}catch(e){return l.error("Date formatting error:",e),"Format Error"}}async function O(r){try{D.setState("isLoading",!0);const[e,t,s]=await Promise.allSettled([I(()=>K(r)),I(()=>J(r)),I(()=>Q(r))]),n={active:e.status==="fulfilled"?e.value:0,reported:t.status==="fulfilled"?t.value:0,banned:s.status==="fulfilled"?s.value:0};return e.status==="rejected"&&l.error("Failed to get active user count:",e.reason),t.status==="rejected"&&l.error("Failed to get reported user count:",t.reason),s.status==="rejected"&&l.error("Failed to get banned user count:",s.reason),D.setState("counts",n),n}catch(e){throw new E("Failed to load admin counts","COUNTS_LOAD_FAILED",e)}finally{D.setState("isLoading",!1)}}async function q(r,e,t,s,n,o,a){if(!S(r))throw new E("Invalid user ID","VALIDATION_ERROR");const d=c(n);if(!d)throw new E("Ban reason is required","VALIDATION_ERROR");try{let i;for(let g=1;g<=R.MAX_RETRIES;g++)try{const v=L.currentUser&&L.currentUser.uid||null,b=await Z(r,e,t,s,d,o,v,a);if(b&&b.success)return l.info("User banned successfully:",{userId:r,reportId:t}),A(`User ${r} has been banned successfully.`,"success"),b;if(b&&b.error==="User is already banned.")return A("User is already banned.","warning"),l.warn("User is already banned.",b),b;throw new E(b?.error||"Ban operation failed","BAN_FAILED")}catch(v){if(i=v,v?.message?.includes("already banned"))return A("User is already banned.","warning"),l.warn("User is already banned.",v),{success:!1,error:"User is already banned."};if(l.warn(`Attempt ${g} failed:`,v.message),g<R.MAX_RETRIES){const b=R.RETRY_DELAY*g;await new Promise(k=>setTimeout(k,b))}}throw i}catch(i){throw l.error("Ban user error:",{userId:r,error:i}),new E("Failed to ban user","BAN_FAILED",i)}}async function j(r,e){if(!S(r))throw new E("Invalid user ID","VALIDATION_ERROR");try{const t=await I(async()=>await G(r,null,e));if(!t||!t.success)throw new E("Unban operation failed","UNBAN_FAILED");return l.info("User unbanned successfully:",{userId:r}),A(`User ${r} has been unbanned successfully.`,"success"),t}catch(t){throw l.error("Unban user error:",{userId:r,error:t}),new E("Failed to unban user","UNBAN_FAILED",t)}}async function de(r,e,t){if(!S(r))throw new E("Invalid report ID","VALIDATION_ERROR");const s=c(e);if(!s)throw new E("Dismiss reason is required","VALIDATION_ERROR");try{const n=L.currentUser&&L.currentUser.uid||null,o=await I(async()=>await ne(r,s,n,t));if(!o||!o.success)throw new E("Dismiss operation failed","DISMISS_FAILED");return l.info("Report dismissed successfully:",{reportId:r}),o}catch(n){throw l.error("Dismiss report error:",{reportId:r,error:n}),new E("Failed to dismiss report","DISMISS_FAILED",n)}}async function C(r,e){const t=document.getElementById("reportedUsersList");if(!t){l.error("Reports container not found");return}H(t,`Loading ${r} reports...`);try{const s=new Promise((a,d)=>setTimeout(()=>d(new E("Request timed out","TIMEOUT")),R.LOADING_TIMEOUT)),n=r==="unresolved"?ee(e):te(e),o=await Promise.race([n,s]);if(!o||o.empty){t.innerHTML=`
        <div style="padding:3rem;text-align:center;color:#666;">
          <div style="font-size:1.2rem;margin-bottom:0.5rem;">No ${r} reports found</div>
          <div style="font-size:0.9rem;">All clear! 🎉</div>
        </div>
      `;return}t.innerHTML="",o.sort((a,d)=>{const i=a.timestamp?.toDate?.()||new Date(a.timestamp||0);return(d.timestamp?.toDate?.()||new Date(d.timestamp||0))-i}),o.forEach(a=>{const d=a.id,i=a.reportedUid||"Unknown User",g=a.reporterUid||"Unknown Reporter",v=a.reportedUsername||i,b=a.reporterUsername||g,k=a.reason||a.report||"No reason provided",m=a.flaggedMessage||"",f=F(a.timestamp),w=document.createElement("div");w.className="content-item",w.style.background="linear-gradient(135deg, #232a3b 0%, #2b3a55 100%)",w.style.border="2px solid #4a90e2",w.style.borderRadius="18px",w.style.boxShadow="0 4px 24px rgba(74,144,226,0.12)",w.style.padding="2rem 2.5rem",w.style.marginBottom="0";const p=document.createElement("div");p.style.display="flex",p.style.alignItems="center",p.style.gap="2rem";const y=document.createElement("div");y.style.flex="1";const x=document.createElement("div");x.style.marginBottom="0.3rem",x.innerHTML=`
        <div style="font-size:1.1rem;color:#fff;font-weight:600;">
          ${v!==i?`${c(v)}<br><span style="font-size:0.95rem;color:#b0b0b0;">${c(i)}</span>`:c(i)}
        </div>
      `,y.appendChild(x);const P=document.createElement("div");P.style.marginBottom="0.3rem",P.innerHTML=`
        <div style="font-size:1.05rem;color:#b0b0b0;">
          Reported By: ${b!==g?`${c(b)}<br><span style="font-size:0.95rem;color:#b0b0b0;">${c(g)}</span>`:c(g)}
        </div>
      `,y.appendChild(P);const M=document.createElement("div");M.style.fontSize="1rem",M.style.color="#4a90e2",M.style.marginTop="0.5rem",M.textContent=`Date: ${f}`,y.appendChild(M);const $=document.createElement("div");$.style.fontWeight="500",$.style.color="#fff",$.style.margin="0.7rem 0 0.3rem 0",$.textContent="Report:";const T=document.createElement("div");if(T.style.color="#b0b0b0",T.style.lineHeight="1.4",T.style.background="rgba(74,144,226,0.08)",T.style.padding="0.75rem",T.style.borderRadius="8px",T.style.wordBreak="break-word",T.textContent=c(k),y.appendChild($),y.appendChild(T),m){const u=document.createElement("div");u.style.fontWeight="500",u.style.color="#fff",u.style.margin="0.7rem 0 0.3rem 0",u.textContent="Flagged Message:";const h=document.createElement("div");h.style.color="#f44336",h.style.lineHeight="1.4",h.style.background="rgba(244,67,54,0.08)",h.style.padding="0.75rem",h.style.borderRadius="8px",h.style.wordBreak="break-word",h.textContent=c(m),y.appendChild(u),y.appendChild(h)}if(r==="resolved"){const u=document.createElement("div");u.style.marginTop="0.5rem",u.style.fontSize="1rem",u.style.color="#4a90e2",u.innerHTML=`<strong>Outcome:</strong> ${c(a.outcome||"N/A")}`,y.appendChild(u);const h=document.createElement("div");h.style.marginTop="0.5rem",h.style.fontSize="1rem",h.style.color="#b0b0b0",h.innerHTML=`<strong>Outcome Reason:</strong> ${c(a.outcomeReason||"N/A")}`,y.appendChild(h);const U=document.createElement("div");U.style.marginTop="0.5rem",U.style.fontSize="1rem",U.style.color="#b0b0b0",U.innerHTML=`<strong>Resolved By:</strong> ${c(a.resolvedBy||"N/A")}`,y.appendChild(U);const N=document.createElement("div");N.style.marginTop="0.5rem",N.style.fontSize="1rem",N.style.color="#b0b0b0",N.innerHTML=`<strong>Resolved At:</strong> ${F(a.resolvedAt)}`,y.appendChild(N)}if(p.appendChild(y),r==="unresolved"){const u=document.createElement("button");u.className="manage-user-btn",u.style.background="linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",u.style.color="#fff",u.style.fontWeight="600",u.style.border="none",u.style.borderRadius="10px",u.style.padding="0.8rem 2rem",u.style.fontSize="1rem",u.textContent="Manage",u.addEventListener("click",()=>{fe({userid:i,username:v,dateStr:f,report:k,reportID:d,flaggedMessage:m,reporterUid:g,reporterUsername:b},async h=>{try{const U=await L.currentUser.getIdToken();await q(i,g,d,k,h,f,U),await C("unresolved",U),await O(U),z()}catch(U){throw U}})}),p.appendChild(u)}w.appendChild(p),t.appendChild(w)}),l.info(`Loaded ${o.length} ${r} reports`)}catch(s){l.error(`Error loading ${r} reports:`,s),t.innerHTML=`
      <div style="padding:3rem;text-align:center;">
        <div style="color:#d32f2f;font-size:1.2rem;margin-bottom:1rem;">⚠️ Error Loading Reports</div>
        <div style="color:#666;margin-bottom:2rem;">${Y(s)}</div>
        <button id="retryBtn" style="
          background:#2196f3;
          color:#fff;
          border:none;
          padding:0.75rem 2rem;
          border-radius:8px;
          font-size:1rem;
          cursor:pointer;
          transition:background 0.2s;
        ">
          Try Again
        </button>
      </div>
    `;const n=t.querySelector("#retryBtn");n&&(n.addEventListener("click",()=>C(r)),n.addEventListener("mouseenter",()=>{n.style.background="#1976d2"}),n.addEventListener("mouseleave",()=>{n.style.background="#2196f3"}))}}function z(){const r=D.counts,e=document.getElementById("activeUsersCount"),t=document.getElementById("reportedUsersCount"),s=document.getElementById("bannedUsersCount");e&&(e.textContent=r.active.toLocaleString(),e.setAttribute("aria-label",`${r.active} active users`)),t&&(t.textContent=r.reported.toLocaleString(),t.setAttribute("aria-label",`${r.reported} reported users`)),s&&(s.textContent=r.banned.toLocaleString(),s.setAttribute("aria-label",`${r.banned} banned users`))}async function le(r){try{l.info("Initializing admin dashboard for user:",r.uid);const e=await r.getIdToken(),t=document.getElementById("toggleContainer");t&&(t.innerHTML="",t.appendChild(ce(e))),H(document.getElementById("reportedUsersList"),"Loading dashboard...");const[s]=await Promise.allSettled([O(e)]);s.status==="fulfilled"?z():(l.error("Failed to load counts:",s.reason),A("Failed to load some dashboard data","warning")),await C("unresolved",e),ue(e),l.info("Dashboard initialized successfully")}catch(e){l.error("Dashboard initialization error:",e),B(e,"Dashboard Initialization");const t=document.getElementById("reportedUsersList");t&&(t.innerHTML=`
        <div style="padding:3rem;text-align:center;">
          <div style="color:#d32f2f;font-size:1.5rem;margin-bottom:1rem;">⚠️ Dashboard Error</div>
          <div style="color:#666;margin-bottom:2rem;">Failed to initialize the admin dashboard. Please refresh the page or contact support.</div>
          <button onclick="location.reload()" style="
            background:#2196f3;
            color:#fff;
            border:none;
            padding:1rem 2rem;
            border-radius:8px;
            font-size:1.1rem;
            cursor:pointer;
          ">
            Refresh Page
          </button>
        </div>
      `)}}function ce(r){const e=document.createElement("div");e.className="toggle-container",e.setAttribute("role","tablist"),e.style.cssText=`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    justify-content: center;
    align-items: center;
  `;const s=[{text:"Unresolved Reports",type:"unresolved",active:!0},{text:"Resolved Reports",type:"resolved",active:!1}].map(({text:o,type:a,active:d})=>{const i=document.createElement("button");return i.textContent=o,i.className=`toggle-btn ${d?"active":""}`,i.setAttribute("role","tab"),i.setAttribute("aria-selected",d.toString()),i.setAttribute("data-type",a),i.style.cssText=`
      background: ${d?"var(--globetalk-card-blue)":"#e0e0e0"};
      color: ${d?"#fff":"#333"};
      border: ${d?"3px solid #4a90e2":"2px solid #e0e0e0"};
      box-shadow: ${d?"0 0 12px 2px #4a90e2":"none"};
      padding: 1rem 2.5rem;
      border-radius: 20px;
      font-size: 1.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
      position: relative;
    `,d&&(i.innerHTML=`<span style="margin-right:8px;">✔️</span>${o}`),i.addEventListener("mouseenter",()=>{i.classList.contains("active")||(i.style.background="#d0d0d0")}),i.addEventListener("mouseleave",()=>{i.classList.contains("active")||(i.style.background="#e0e0e0")}),i.addEventListener("focus",()=>{i.style.boxShadow="0 0 0 2px rgba(33, 150, 243, 0.5)"}),i.addEventListener("blur",()=>{i.style.boxShadow=i.classList.contains("active")?"0 0 12px 2px #4a90e2":"none"}),i});function n(o){s.forEach(a=>{const d=a===o;a.style.background=d?"var(--globetalk-card-blue)":"#e0e0e0",a.style.color=d?"#fff":"#333",a.style.border=d?"3px solid #4a90e2":"2px solid #e0e0e0",a.style.boxShadow=d?"0 0 12px 2px #4a90e2":"none",a.classList.toggle("active",d),a.setAttribute("aria-selected",d.toString()),a.innerHTML=d?`<span style="margin-right:8px;">✔️</span>${a.textContent.replace("✔️","").trim()}`:a.textContent.replace("✔️","").trim()})}return s.forEach(o=>{o.addEventListener("click",async()=>{const a=o.getAttribute("data-type");n(o),D.setState("currentView",a);const d=await L.currentUser.getIdToken();await C(a,d)}),o.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),o.click())})}),s.forEach(o=>e.appendChild(o)),e}function ue(r){const e=document.getElementById("bannedUsersCount"),t=e?.closest('.stat-card, [data-stat="banned"]')||e?.parentElement;if(t){t.style.cursor="pointer",t.style.transition="transform 0.2s ease, box-shadow 0.2s ease",t.title="Click to view all banned accounts",t.setAttribute("role","button"),t.setAttribute("tabindex","0"),t.setAttribute("aria-label","View banned accounts");const s=async()=>{try{H({innerHTML:""},"Loading banned users...");const n=await I(()=>re(r));me(n)}catch(n){B(n,"Load Banned Users")}};t.addEventListener("click",s),t.addEventListener("mouseenter",()=>{t.style.transform="translateY(-2px)",t.style.boxShadow="0 4px 12px rgba(0,0,0,0.15)"}),t.addEventListener("mouseleave",()=>{t.style.transform="translateY(0)",t.style.boxShadow="none"}),t.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),s())}),t.addEventListener("focus",()=>{t.style.outline="2px solid #2196f3",t.style.outlineOffset="2px"}),t.addEventListener("blur",()=>{t.style.outline="none",t.style.outlineOffset="initial"})}}function V(r,e,t={}){const s=document.getElementById(r);s&&s.remove();const n=document.createElement("div");n.id=r,n.className="modal",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-labelledby",`${r}-title`),n.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(10, 20, 40, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${R.MODAL_Z_INDEX};
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(6px) saturate(1.2);
  `,n.innerHTML=e,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="1"},10);const o=n.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');o.length>0&&o[0].focus();const a=i=>{i.key==="Escape"&&d()},d=()=>{n.style.opacity="0",setTimeout(()=>{n.parentNode&&n.remove()},300),document.removeEventListener("keydown",a)};return document.addEventListener("keydown",a),t.preventOutsideClick||n.addEventListener("click",i=>{i.target===n&&d()}),{modal:n,closeModal:d}}function me(r){const e=`
    <div style="background:linear-gradient(135deg, #232a3b 0%, #2b3a55 100%); border:3px solid #4a90e2; box-shadow:0 16px 48px 0 rgba(74,144,226,0.25), 0 2px 8px 0 rgba(0,0,0,0.18); padding:2.5rem 2rem; border-radius:28px; min-width:340px; max-width:95vw; max-height:80vh; display:flex; flex-direction:column;">
      <h2 id="bannedUsersModal-title" style="margin-bottom:1.5rem;font-size:2.2rem; color:#4a90e2; text-align:center; letter-spacing:0.5px;">Banned Accounts (${r.length})</h2>
      <div style="flex:1;max-height:50vh;overflow-y:auto;margin-bottom:1.5rem;">
        ${r.length===0?'<div style="text-align:center;padding:2rem;color:#b0b0b0;font-size:1.2rem;">No banned accounts found.</div>':`<ul style="list-style:none;padding:0;margin:0;">
            ${r.map(o=>`
              <li style="margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:1.2rem 1rem;background:rgba(74,144,226,0.08);border:2px solid #4a90e2;border-radius:12px;">
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;word-break:break-all;color:#fff;font-size:1.1rem;">${c(o.email||o.id||"Unknown User")}</div>
                  <div style="color:#4a90e2;font-size:0.98rem;margin-top:0.25rem;">Banned: ${F(o.banDate)}</div>
                  ${o.banReason?`<div style="color:#b0b0b0;font-size:0.95rem;margin-top:0.25rem;">Reason: ${c(o.banReason)}</div>`:""}
                </div>
                <button class="unban-btn" data-id="${o.id}" style="background:linear-gradient(135deg,#4caf50 0%,#388e3c 100%);color:#fff;border:none;padding:0.85rem 1.7rem;border-radius:10px;font-size:1rem;cursor:pointer;white-space:nowrap;transition:background 0.2s;font-weight:600;">Unban</button>
              </li>
            `).join("")}
          </ul>`}
      </div>
      <button id="closeBannedModalBtn" style="background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);color:#333;border:1px solid #4a90e2;padding:1rem 2.2rem;border-radius:14px;font-size:1.15rem;cursor:pointer;transition:background 0.2s;font-weight:600;margin:0 auto;">Close</button>
    </div>
  `,{modal:t,closeModal:s}=V("bannedUsersModal",e);t.querySelectorAll(".unban-btn").forEach(o=>{o.addEventListener("click",async()=>{const a=o.dataset.id;if(!S(a)){A("Invalid user ID","error");return}const d=o.textContent;o.disabled=!0,o.textContent="Unbanning...",o.style.background="#ccc";try{const i=await L.currentUser.getIdToken();await j(a,i);const g=o.closest("li");g&&(g.style.opacity="0",setTimeout(()=>g.remove(),300)),await O(i),z()}catch(i){B(i,"Unban User"),o.disabled=!1,o.textContent=d,o.style.background="#4caf50"}}),o.addEventListener("mouseenter",()=>{o.disabled||(o.style.background="#45a049")}),o.addEventListener("mouseleave",()=>{o.disabled||(o.style.background="#4caf50")})});const n=t.querySelector("#closeBannedModalBtn");n.addEventListener("click",s),n.addEventListener("mouseenter",()=>{n.style.background="#e0e0e0"}),n.addEventListener("mouseleave",()=>{n.style.background="#f5f5f5"})}function fe({userid:r,username:e,dateStr:t,report:s,reportID:n,flaggedMessage:o,reporterUid:a,reporterUsername:d},i){const g=`
    <div style="background:linear-gradient(135deg, #232a3b 0%, #2b3a55 100%); border:3px solid #4a90e2; box-shadow:0 16px 48px 0 rgba(74,144,226,0.25), 0 2px 8px 0 rgba(0,0,0,0.18); padding:2.5rem 2rem; border-radius:28px; min-width:340px; max-width:95vw; display:flex; flex-direction:column;">
      <h2 id="manageUserModal-title" style="margin-bottom:1.5rem;font-size:2.2rem; color:#4a90e2; text-align:center; letter-spacing:0.5px;">Manage User</h2>
      <div style="margin-bottom:1rem;font-size:1.15rem;color:#fff;">
        <strong>Username:</strong>
        <span style="word-break:break-all;">
          ${e!==r?`${c(e)}<br><span style="font-size:0.98rem;color:#b0b0b0;">${c(r)}</span>`:c(r)}
        </span>
      </div>
      <div style="margin-bottom:1rem;font-size:1.1rem;color:#b0b0b0;">
        <strong>Date:</strong> ${c(t)}
      </div>
      <div style="margin-bottom:2rem;font-size:1.1rem;">
        <strong>Report:</strong>
        <div style="background:rgba(74,144,226,0.08);padding:1rem;border-radius:8px;margin-top:0.5rem;word-break:break-word;color:#fff;">
          ${c(s)}
        </div>
      </div>
      ${o?`
        <div style="margin-bottom:2rem;font-size:1.1rem;">
          <strong>Reported Message:</strong>
          <div style="background:rgba(244,67,54,0.08);padding:1rem;border-radius:8px;margin-top:0.5rem;word-break:break-word;color:#f44336;">
            ${c(o)}
          </div>
        </div>
      `:""}
      <div style="margin-bottom:2rem;">
        <label for="banReason" style="display:block;margin-bottom:0.5rem;font-weight:600;color:#4a90e2;">Ban/Dismiss Reason (required):</label>
        <textarea id="banReason" placeholder="Enter reason for banning this user..." style="width:100%;min-height:80px;padding:0.75rem;border:2px solid #4a90e2;border-radius:10px;resize:vertical;font-family:inherit;background:rgba(255,255,255,0.08);color:#fff;"></textarea>
      </div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <button id="banUserBtn" style="background:linear-gradient(135deg,#d32f2f 0%,#b71c1c 100%);color:#fff;border:none;padding:1rem 2.2rem;border-radius:14px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;font-weight:600;">Ban User</button>
        <button id="dismissUserBtn" style="background:linear-gradient(135deg,#ff9800 0%,#ffb300 100%);color:#fff;border:none;padding:1rem 2.2rem;border-radius:14px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;font-weight:600;">Dismiss Report</button>
        <button id="closeModalBtn" style="background:linear-gradient(135deg,#f5f5f5 0%,#e0e0e0 100%);color:#333;border:1px solid #4a90e2;padding:1rem 2.2rem;border-radius:14px;font-size:1.1rem;cursor:pointer;transition:background 0.2s;flex:1;min-width:120px;font-weight:600;">Cancel</button>
      </div>
    </div>
  `,{modal:v,closeModal:b}=V("manageUserModal",g,{preventOutsideClick:!0}),k=v.querySelector("#banReason"),m=v.querySelector("#banUserBtn"),f=v.querySelector("#dismissUserBtn"),w=v.querySelector("#closeModalBtn");k.addEventListener("input",()=>{const p=k.value.trim();m.disabled=!p,m.style.background=p?"#d32f2f":"#ccc",f.disabled=!p,f.style.background=p?"#ff9800":"#ccc"}),m.disabled=!0,m.style.background="#ccc",f.disabled=!0,f.style.background="#ccc",m.addEventListener("click",async()=>{const p=c(k.value);if(!p){A("Please provide a reason for banning this user.","error"),k.focus();return}const y=m.textContent;m.disabled=!0,m.textContent="Banning...",m.style.background="#ccc";try{const x=await L.currentUser.getIdToken();await q(r,a,n,s,p,t,x),b(),await C("unresolved",x),await O(x),z()}catch(x){B(x,"Ban User"),m.disabled=!1,m.textContent=y,m.style.background="#d32f2f"}}),f.addEventListener("click",async()=>{const p=c(k.value);if(!p){A("Please provide a reason for dismissing this report.","error"),k.focus();return}const y=f.textContent;f.disabled=!0,f.textContent="Dismissing...",f.style.background="#ccc";try{const x=await L.currentUser.getIdToken();await de(n,p,x),A("Report dismissed successfully.","success"),b(),await C("unresolved",x)}catch(x){B(x,"Dismiss Report"),f.disabled=!1,f.textContent=y,f.style.background="#ff9800"}}),w.addEventListener("click",b),m.addEventListener("mouseenter",()=>{m.disabled||(m.style.background="#b71c1c")}),m.addEventListener("mouseleave",()=>{m.disabled||(m.style.background="#d32f2f")}),f.addEventListener("mouseenter",()=>{f.disabled||(f.style.background="#f57c00")}),f.addEventListener("mouseleave",()=>{f.disabled||(f.style.background="#ff9800")}),w.addEventListener("mouseenter",()=>{w.style.background="#e0e0e0"}),w.addEventListener("mouseleave",()=>{w.style.background="#f5f5f5"}),setTimeout(()=>{k.focus()},100)}document.addEventListener("DOMContentLoaded",()=>{l.info("DOM loaded, setting up admin dashboard");const r=document.getElementById("logoutBtn");r&&r.addEventListener("click",async e=>{e.preventDefault();try{await oe()}catch(t){l.error("Logout error",t)}finally{window.location.href="login.html"}}),se(L,async e=>{if(!e){l.warn("No authenticated user, redirecting to login"),window.location.href="login.html";return}try{await le(e)}catch(t){l.error("Authentication handler error:",t),B(t,"Authentication")}}),window.addEventListener("error",e=>{l.error("Global error:",{message:e.message,filename:e.filename,lineno:e.lineno,colno:e.colno,error:e.error})}),window.addEventListener("unhandledrejection",e=>{l.error("Unhandled promise rejection:",e.reason),e.preventDefault()}),document.addEventListener("visibilitychange",ae(async()=>{if(!document.hidden&&L.currentUser)try{l.info("Tab became visible, refreshing data");const e=await L.currentUser.getIdToken();await O(e),z(),await C(D.currentView,e)}catch(e){l.warn("Failed to refresh data on visibility change:",e)}},1e3))});window.addEventListener("beforeunload",()=>{D.listeners.clear(),l.info("Page unloading, cleanup completed")});typeof _<"u"&&_.exports&&(_.exports={AppError:E,Logger:l,formatDate:F,sanitizeInput:c,validateUserId:S,validateEmail:ie,performBanUser:q,performUnbanUser:j,AdminDashboardState:X})});export default ge();
