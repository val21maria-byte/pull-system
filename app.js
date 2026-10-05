
const DEFAULT_DATA = {
  brand: "PULL STUDIO",
  people: [
    {id:"P01",name:"김민수",role:"스타일리스트",contact:"@minsoo.style"},
    {id:"P02",name:"서하린",role:"패션 에디터",contact:"@harin.seo"},
    {id:"P03",name:"정유나",role:"셀럽 스타일리스트",contact:"010-****-2918"},
    {id:"P04",name:"이도현",role:"콘텐츠 크리에이터",contact:"@dohyun.archive"}
  ],
  samples: [
    {id:"PULL-0001",name:"브라운 블루종 재킷",category:"아우터",color:"브라운",size:"M",image:"assets/jacket.png",status:"loan",borrower:"P01",due:"2026-10-08",usage:"매거진 에디토리얼"},
    {id:"PULL-0002",name:"블랙 소프트 토트백",category:"가방",color:"블랙",size:"OS",image:"assets/bag.png",status:"available",borrower:null,due:null,usage:""},
    {id:"PULL-0003",name:"디스트레스드 와이드 데님",category:"하의",color:"블루",size:"M",image:"assets/jeans.png",status:"overdue",borrower:"P03",due:"2026-10-02",usage:"셀럽 피팅"},
    {id:"PULL-0004",name:"그레이 집업 후드",category:"상의",color:"그레이",size:"L",image:"assets/hoodie.png",status:"available",borrower:null,due:null,usage:""},
    {id:"PULL-0005",name:"블랙 레더 재킷",category:"아우터",color:"블랙",size:"M",image:"assets/jacket.png",status:"loan",borrower:"P02",due:"2026-10-11",usage:"에디토리얼 촬영"},
    {id:"PULL-0006",name:"아카이브 백 02",category:"가방",color:"블랙",size:"OS",image:"assets/bag.png",status:"available",borrower:null,due:null,usage:""}
  ],
  subscription: null,
  activities: [
    {time:"오늘 14:36",sample:"PULL-0001",text:"Brown Blouson Jacket 대여 등록",meta:"김민수 · Magazine editorial"},
    {time:"오늘 13:10",sample:"PULL-0004",text:"Grey Zip Hoodie 반납 완료",meta:"대여 가능"},
    {time:"어제 18:42",sample:"PULL-0003",text:"Distressed Wide Denim 반납 예정일 경과",meta:"정유나"},
    {time:"어제 11:05",sample:"PULL-0002",text:"Black Soft Tote 샘플 등록",meta:"가방"},
    {time:"10/02 16:20",sample:"PULL-0005",text:"Black Leather Jacket 대여 등록",meta:"서하린 · Editorial shoot"}
  ]
};

let state = loadState();
function loadState(){
  try { return JSON.parse(localStorage.getItem("pullState")) || structuredClone(DEFAULT_DATA); }
  catch(e){ return structuredClone(DEFAULT_DATA); }
}
function saveState(){ localStorage.setItem("pullState", JSON.stringify(state)); }
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function personName(id){ return state.people.find(p=>p.id===id)?.name || "—"; }
function statusLabel(s){ return s==="available"?"대여 가능":s==="loan"?"대여 중":"연체"; }
function fmtDate(d){ if(!d) return "—"; const x=new Date(d+"T00:00:00"); return `${x.getMonth()+1}/${x.getDate()}`; }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

function openApp(){
  $("#marketing").classList.add("hidden");
  $("#siteHeader").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  showPage("dashboard");
}
function closeApp(){
  stopCamera();
  $("#appShell").classList.add("hidden");
  $("#marketing").classList.remove("hidden");
  $("#siteHeader").classList.remove("hidden");
}
$$("[data-open-app]").forEach(b=>b.addEventListener("click",openApp));
$("#closeApp").addEventListener("click",closeApp);

const titles = {
  dashboard:["개요","대시보드"],
  samples:["라이브러리","샘플"],
  loans:["이동 현황","대여"],
  people:["디렉토리","대여자"],
  activity:["기록","활동 기록"],
  scan:["빠른 실행","스캔"],
  settings:["작업공간","설정"]
};
function showPage(name){
  $$(".page").forEach(p=>p.classList.add("hidden"));
  $(`#page-${name}`).classList.remove("hidden");
  $$("#appNav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  $("#pageEyebrow").textContent=titles[name][0]; $("#pageTitle").textContent=titles[name][1];
  $(".sidebar").classList.remove("open");
  renderAll();
}
$$("#appNav button,[data-page='settings']").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
$("#sidebarToggle").addEventListener("click",()=>$(".sidebar").classList.toggle("open"));

function renderAll(){
  renderMetrics(); renderDue(); renderActivity(); renderPreview(); renderSamples(); renderLoans(); renderPeople(); fillLoanForm(); renderSubscription();
}
function renderMetrics(){
  const total=state.samples.length, loan=state.samples.filter(s=>s.status==="loan").length, overdue=state.samples.filter(s=>s.status==="overdue").length, available=state.samples.filter(s=>s.status==="available").length;
  $("#metrics").innerHTML = [
    ["전체 샘플",total,"전체 등록 샘플"],
    ["대여 중",loan,"현재 외부 대여 중"],
    ["연체",overdue,"반납 예정일 경과"],
    ["대여 가능",available,"즉시 대여 가능"]
  ].map(x=>`<div class="metric"><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join("");
}
function renderDue(){
  const items=state.samples.filter(s=>s.status!=="available").sort((a,b)=>(a.due||"").localeCompare(b.due||""));
  $("#dueList").innerHTML = items.length?items.map(s=>`
    <div class="due-item" onclick="openSample('${s.id}')">
      <img class="due-thumb" src="${s.image}">
      <div><b>${s.name}</b><small>${personName(s.borrower)}</small></div>
      <div class="due-date ${s.status==="overdue"?"overdue-text":""}"><b>${s.status==="overdue"?"연체":"반납 예정"}</b><small>${fmtDate(s.due)}</small></div>
    </div>`).join(""):`<p class="muted">대여 중인 샘플이 없습니다.</p>`;
}
function renderActivity(){
  const rows=state.activities.map(a=>`<div class="activity-item"><span class="activity-bullet"></span><p>${a.text}<br><span>${a.meta}</span></p><time>${a.time}</time></div>`).join("");
  $("#recentActivity").innerHTML=state.activities.slice(0,4).map(a=>`<div class="activity-item"><span class="activity-bullet"></span><p>${a.text}<br><span>${a.meta}</span></p><time>${a.time}</time></div>`).join("");
  $("#activityFull").innerHTML=rows;
}
function renderPreview(){
  $("#samplePreview").innerHTML=state.samples.slice(0,4).map(s=>`
    <button class="sample-preview-card" onclick="openSample('${s.id}')" style="text-align:left;border:1px solid #dedbd3;padding:0">
      <img src="${s.image}"><div><b>${s.name}</b><small>${s.id} · ${statusLabel(s.status)}</small></div>
    </button>`).join("");
}
function renderSamples(){
  const q=($("#sampleSearch")?.value||"").toLowerCase(), f=$("#statusFilter")?.value||"all";
  const arr=state.samples.filter(s=>(f==="all"||s.status===f) && `${s.name} ${s.id} ${s.category}`.toLowerCase().includes(q));
  if(!$("#sampleTableBody")) return;
  $("#sampleTableBody").innerHTML=arr.map(s=>`
    <tr>
      <td><div class="sample-cell"><img src="${s.image}"><div><b>${s.name}</b><small>${s.category} · ${s.color} · ${s.size}</small></div></div></td>
      <td>${s.id}</td>
      <td><span class="status ${s.status}"><i></i>${statusLabel(s.status)}</span></td>
      <td>${personName(s.borrower)}</td>
      <td>${fmtDate(s.due)}</td>
      <td><button class="row-action" onclick="openSample('${s.id}')">···</button></td>
    </tr>`).join("");
}
$("#sampleSearch")?.addEventListener("input",renderSamples);
$("#statusFilter")?.addEventListener("change",renderSamples);

function renderLoans(){
  const arr=state.samples.filter(s=>s.status!=="available");
  $("#loanCards").innerHTML=arr.map(s=>`
    <article class="loan-card">
      <div class="loan-top"><img src="${s.image}"><div><span class="status ${s.status}"><i></i>${statusLabel(s.status)}</span><b style="display:block;margin-top:10px">${s.name}</b><small>${s.id}</small></div></div>
      <div class="loan-meta"><div><small>대여자</small><b>${personName(s.borrower)}</b></div><div><small>반납 예정</small><b>${fmtDate(s.due)}</b></div></div>
      <button class="btn btn-light" onclick="returnSample('${s.id}')">반납 완료 처리</button>
    </article>`).join("");
}
function renderPeople(){
  $("#peopleGrid").innerHTML=state.people.map(p=>{
    const active=state.samples.filter(s=>s.borrower===p.id && s.status!=="available").length;
    return `<article class="person-card"><div class="person-head"><div class="person-avatar">${p.name.slice(0,1)}</div><div><h4>${p.name}</h4><p>${p.role}</p></div></div><p>${p.contact}</p><div class="stats"><div><small>진행 중인 대여</small><b>${active}</b></div><div><small>총 샘플</small><b>${active}</b></div></div></article>`
  }).join("");
}

function openSample(id){
  const s=state.samples.find(x=>x.id===id); if(!s) return;
  $("#sampleModalContent").innerHTML=`
    <div class="sample-detail">
      <img class="sample-detail-image" src="${s.image}">
      <div>
        <div class="detail-head"><div><small class="detail-id">${s.id}</small><h3>${s.name}</h3><span class="status ${s.status}"><i></i>${statusLabel(s.status)}</span></div></div>
        <div class="detail-grid">
          <div class="detail-box"><small>카테고리</small><b>${s.category}</b></div>
          <div class="detail-box"><small>색상 / 사이즈</small><b>${s.color} / ${s.size}</b></div>
          <div class="detail-box"><small>대여자</small><b>${personName(s.borrower)}</b></div>
          <div class="detail-box"><small>반납 예정</small><b>${fmtDate(s.due)}</b></div>
          <div class="detail-box" style="grid-column:1/-1"><small>사용처</small><b>${s.usage||"—"}</b></div>
        </div>
        <div class="detail-qr"><img src="assets/qr/${s.id}.png" onerror="this.style.display='none'"><div><small>QR 샘플 ID</small><b style="display:block">${s.id}</b><span style="font-size:11px;color:#88847d">스캔 시 이 샘플 페이지로 연결됩니다.</span></div></div>
        <div class="detail-actions">
          ${s.status==="available"?`<button class="btn btn-dark" onclick="openLoanFor('${s.id}')">대여 등록</button>`:`<button class="btn btn-dark" onclick="returnSample('${s.id}')">Mark returned</button>`}
          <button class="btn btn-outline" onclick="copyId('${s.id}')">ID 복사</button>
        </div>
      </div>
    </div>`;
  $("#sampleModal").classList.remove("hidden");
}
window.openSample=openSample;
window.copyId=(id)=>{navigator.clipboard?.writeText(id);toast(`${id} 복사됨`);}
function closeModals(){ $$(".modal").forEach(m=>m.classList.add("hidden")); }
$$("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModals));
$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m) closeModals();}));

function fillLoanForm(){
  if(!$("#loanSample")) return;
  $("#loanSample").innerHTML=state.samples.filter(s=>s.status==="available").map(s=>`<option value="${s.id}">${s.id} · ${s.name}</option>`).join("");
  $("#loanPerson").innerHTML=state.people.map(p=>`<option value="${p.id}">${p.name} · ${p.role}</option>`).join("");
  const d=new Date();d.setDate(d.getDate()+7);$("#loanDue").value=d.toISOString().slice(0,10);
}
function openLoanFor(id){
  closeModals(); $("#loanModal").classList.remove("hidden"); fillLoanForm(); if(id) $("#loanSample").value=id;
}
$("#newLoanBtn").addEventListener("click",()=>openLoanFor());
$("#newLoanBtn2").addEventListener("click",()=>openLoanFor());
$("#loanForm").addEventListener("submit",e=>{
  e.preventDefault();
  const s=state.samples.find(x=>x.id===$("#loanSample").value);
  if(!s) return;
  s.status="loan"; s.borrower=$("#loanPerson").value; s.due=$("#loanDue").value; s.usage=$("#loanUsage").value;
  state.activities.unshift({time:"방금",sample:s.id,text:`${s.name} 대여 등록`,meta:`${personName(s.borrower)} · ${s.usage||"사용처 미입력"}`});
  saveState();closeModals();renderAll();toast("대여가 등록되었습니다.");
});
function returnSample(id){
  const s=state.samples.find(x=>x.id===id);if(!s)return;
  s.status="available";s.borrower=null;s.due=null;s.usage="";
  state.activities.unshift({time:"방금",sample:s.id,text:`${s.name} 반납 완료`,meta:"대여 가능"});
  saveState();closeModals();renderAll();toast("반납 완료 처리되었습니다.");
}
window.returnSample=returnSample;

$("#addSampleBtn").addEventListener("click",()=>$("#addSampleModal").classList.remove("hidden"));
$("#sampleForm").addEventListener("submit",e=>{
 e.preventDefault();
 const n=state.samples.length+1,id=`PULL-${String(n).padStart(4,"0")}`;
 state.samples.push({id,name:$("#newSampleName").value,category:$("#newSampleCategory").value,color:$("#newSampleColor").value||"—",size:$("#newSampleSize").value||"OS",image:"assets/jacket.png",status:"available",borrower:null,due:null,usage:""});
 state.activities.unshift({time:"방금",sample:id,text:`${$("#newSampleName").value} 샘플 등록`,meta:$("#newSampleCategory").value});
 saveState();e.target.reset();closeModals();renderAll();toast(`${id} 샘플이 추가되었습니다.`);
});
$("#addPersonBtn").addEventListener("click",()=>$("#personModal").classList.remove("hidden"));
$("#personForm").addEventListener("submit",e=>{
 e.preventDefault(); const id=`P${String(state.people.length+1).padStart(2,"0")}`;
 state.people.push({id,name:$("#personName").value,role:$("#personRole").value||"연락처",contact:$("#personContact").value||"—"});
 saveState();e.target.reset();closeModals();renderAll();toast("대여자가 추가되었습니다.");
});

$("#lookupSampleBtn").addEventListener("click",()=>{const id=$("#manualSampleId").value.trim().toUpperCase(); if(state.samples.some(s=>s.id===id)) openSample(id); else toast("등록된 Sample ID가 아닙니다.");});
$$(".demo-ids button").forEach(b=>b.addEventListener("click",()=>{$("#manualSampleId").value=b.dataset.id;openSample(b.dataset.id)}));

let cameraStream=null,scanTimer=null;
async function startCamera(){
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    const v=$("#camera");v.srcObject=cameraStream;$("#cameraFallback").classList.add("hidden");
    $("#startCameraBtn").textContent="카메라 종료";
    if("BarcodeDetector" in window){
      const detector=new BarcodeDetector({formats:["qr_code"]});
      scanTimer=setInterval(async()=>{
        try{
          const codes=await detector.detect(v);
          if(codes.length){ const raw=codes[0].rawValue||""; const id=(raw.match(/PULL-\d{4}/)||[])[0]; if(id){ stopCamera(); openSample(id); } }
        }catch(e){}
      },700);
    } else toast("QR 자동 인식은 일부 브라우저에서만 지원됩니다. 카메라는 미리보기로 사용할 수 있습니다.");
  }catch(e){toast("카메라 권한을 사용할 수 없습니다. Sample ID 조회를 이용하세요.");}
}
function stopCamera(){ if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;} if(scanTimer){clearInterval(scanTimer);scanTimer=null;} $("#cameraFallback")?.classList.remove("hidden"); if($("#startCameraBtn"))$("#startCameraBtn").textContent="카메라 시작"; }
$("#startCameraBtn").addEventListener("click",()=>cameraStream?stopCamera():startCamera());

$("#exportBtn").addEventListener("click",()=>{
 const rows=[["id","name","category","status","borrower","due","usage"],...state.samples.map(s=>[s.id,s.name,s.category,s.status,personName(s.borrower),s.due||"",s.usage||""])];
 const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pull-samples.csv";a.click();URL.revokeObjectURL(a.href);toast("CSV를 내보냈습니다.");
});
$("#saveSettingsBtn").addEventListener("click",()=>{state.brand=$("#brandNameInput").value||"PULL STUDIO";saveState();toast("설정이 저장되었습니다.");});
$("#resetDemoBtn").addEventListener("click",()=>{if(confirm("데모 데이터를 초기화할까요?")){localStorage.removeItem("pullState");state=structuredClone(DEFAULT_DATA);renderAll();toast("데모 데이터가 초기화되었습니다.");}});

// CHECKOUT / ONBOARDING
let checkoutStep = 1;

function openCheckout(){
  stopCamera?.();
  $("#marketing").classList.add("hidden");
  $("#siteHeader").classList.add("hidden");
  $("#appShell").classList.add("hidden");
  $("#checkoutShell").classList.remove("hidden");
  setCheckoutStep(1);
  hydrateCheckoutFromState();
}
function closeCheckout(){
  $("#checkoutShell").classList.add("hidden");
  $("#marketing").classList.remove("hidden");
  $("#siteHeader").classList.remove("hidden");
}
function setCheckoutStep(step){
  checkoutStep = step;
  $$(".checkout-step").forEach(s=>s.classList.toggle("hidden", String(s.dataset.step)!==String(step)));
  $$(".progress-item").forEach(p=>p.classList.toggle("active", Number(p.dataset.progress)<=Number(step)));
  $("#checkoutShell")?.scrollTo({top:0,behavior:"smooth"});
  if(Number(step)===5) renderCheckoutRecap();
}
function checkoutVal(id){ return ($(id)?.value || "").trim(); }
function requireFields(ids){
  for(const id of ids){
    const el=$(id);
    if(!el || !String(el.value||"").trim()){
      el?.focus(); toast("필수 정보를 입력해주세요."); return false;
    }
  }
  return true;
}
function validateStep(from){
  if(Number(from)===1){
    if(!$("#planAgree").checked){ toast("스타터 플랜 조건을 확인해주세요."); return false; }
  }
  if(Number(from)===2){
    if(!requireFields(["#coBrandName","#coManagerName","#coEmail","#coPhone"])) return false;
    if(!$("#coEmail").value.includes("@")){ $("#coEmail").focus();toast("이메일 형식을 확인해주세요.");return false; }
  }
  if(Number(from)===3){
    if(!requireFields(["#coRecipient","#coZip","#coAddress1"])) return false;
  }
  if(Number(from)===4){
    if(!requireFields(["#coLoginEmail","#coPassword","#coPassword2"])) return false;
    if($("#coPassword").value.length<8){ $("#coPassword").focus();toast("비밀번호는 8자 이상으로 입력해주세요.");return false; }
    if($("#coPassword").value!==$("#coPassword2").value){ $("#coPassword2").focus();toast("비밀번호가 일치하지 않습니다.");return false; }
  }
  return true;
}
function hydrateCheckoutFromState(){
  if(state.subscription?.brand){
    const b=state.subscription.brand;
    $("#coBrandName").value=b.name||"";
    $("#coManagerName").value=b.manager||"";
    $("#coManagerRole").value=b.role||"";
    $("#coEmail").value=b.email||"";
    $("#coPhone").value=b.phone||"";
    $("#coWebsite").value=b.website||"";
    $("#coLoginEmail").value=b.loginEmail||b.email||"";
  }
}
function renderCheckoutRecap(){
  const address=[checkoutVal("#coAddress1"),checkoutVal("#coAddress2")].filter(Boolean).join(" ");
  $("#checkoutRecap").innerHTML=`
    <div class="recap-row"><span>플랜</span><b>PULL 스타터 · 월 ₩49,000</b></div>
    <div class="recap-row"><span>브랜드</span><b>${checkoutVal("#coBrandName")||"—"}</b></div>
    <div class="recap-row"><span>스타터 키트</span><b>QR Sample ID × 100</b></div>
    <div class="recap-row"><span>배송지</span><b>${address||"—"}</b></div>`;
}
function makeOrderNo(){
  const d=new Date();
  return `PULL-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;
}
function completeTestCheckout(){
  if(!$("#paymentAgree").checked){toast("구독 및 주문 내용을 확인해주세요.");return;}
  const orderNo=makeOrderNo();
  const brand={
    name:checkoutVal("#coBrandName"),
    manager:checkoutVal("#coManagerName"),
    role:checkoutVal("#coManagerRole"),
    email:checkoutVal("#coEmail"),
    phone:checkoutVal("#coPhone"),
    website:checkoutVal("#coWebsite"),
    loginEmail:checkoutVal("#coLoginEmail")
  };
  const shipping={
    recipient:checkoutVal("#coRecipient"),
    zip:checkoutVal("#coZip"),
    address1:checkoutVal("#coAddress1"),
    address2:checkoutVal("#coAddress2"),
    memo:checkoutVal("#coMemo")
  };
  state.brand=brand.name||"PULL STUDIO";
  state.subscription={
    status:"test_active",
    plan:"스타터",
    price:49000,
    qrIncluded:100,
    kitStatus:"배송 준비중",
    orderNo,
    startedAt:new Date().toISOString(),
    brand,
    shipping
  };
  saveState();
  $("#successOrderNo").textContent=orderNo;
  $("#successAddress").innerHTML=`<small>스타터 키트 배송지</small><b>${shipping.recipient} · ${shipping.zip} · ${shipping.address1} ${shipping.address2}</b>`;
  setCheckoutStep("success");
  renderAll();
}
function renderSubscription(){
  const sub=state.subscription;
  const banner=$("#subscriptionBanner");
  if(!banner) return;
  if(sub){
    banner.classList.remove("hidden");
    $("#subscriptionBrandName").textContent=sub.brand?.name||state.brand||"PULL STUDIO";
    const accountName=$(".brand-account b"); if(accountName) accountName.textContent=sub.brand?.name||state.brand||"PULL STUDIO";
    const avatar=$(".brand-account .avatar"); if(avatar) avatar.textContent=(sub.brand?.name||"PS").replace(/[^A-Za-z가-힣]/g,"").slice(0,2).toUpperCase()||"PS";
    if($("#brandNameInput")) $("#brandNameInput").value=sub.brand?.name||state.brand||"PULL STUDIO";
  }else{
    banner.classList.add("hidden");
  }
}
$$("[data-open-checkout]").forEach(b=>b.addEventListener("click",openCheckout));
$("#closeCheckout")?.addEventListener("click",closeCheckout);
$("#checkoutHomeBtn")?.addEventListener("click",closeCheckout);
$$(".checkout-next").forEach(b=>b.addEventListener("click",()=>{ if(validateStep(checkoutStep)) setCheckoutStep(Number(b.dataset.next)); }));
$$(".checkout-back").forEach(b=>b.addEventListener("click",()=>setCheckoutStep(Number(b.dataset.back))));
$("#testPayBtn")?.addEventListener("click",completeTestCheckout);
$("#enterWorkspaceBtn")?.addEventListener("click",()=>{ $("#checkoutShell").classList.add("hidden"); openApp(); showPage("dashboard"); });
$("#coEmail")?.addEventListener("blur",()=>{ if(!$("#coLoginEmail").value) $("#coLoginEmail").value=$("#coEmail").value; });


renderAll();
