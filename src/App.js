import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SB_URL = "https://zzidtjejzuypgiewwmva.supabase.co";
const SB_KEY = "sb_publishable_hp6Q2GdIDBDEXm2-B4et5Q_mEFpEdoJ";
const supabase = createClient(SB_URL, SB_KEY);
const SYNC_ROW = "main";

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = useCallback((u) => {
    setV(p => { const n = typeof u === "function" ? u(p) : u; try { localStorage.setItem(key, JSON.stringify(n)); } catch {} return n; });
  }, [key]);
  return [v, set];
}
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

const today = () => new Date().toISOString().split("T")[0];
const mk    = (d = new Date()) => d.toISOString().slice(0, 7);

function calcPayoff(total, rate, monthly) {
  if (!total || monthly <= 0) return null;
  const r = rate / 100 / 12;
  let bal = total, m = 0;
  while (bal > 0.01 && m < 600) {
    bal = r > 0 ? bal * (1 + r) - monthly : bal - monthly;
    if (bal < 0) bal = 0;
    m++;
  }
  if (m >= 600) return null;
  return { months: m, totalPaid: m * monthly, interest: Math.max(0, m * monthly - total) };
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#0A0A0A", surface:"#141414", surfaceHover:"#1C1C1C",
  border:"#242424", borderLight:"#2E2E2E",
  text:"#FAFAFA", textSecondary:"#A0A0A0", textTertiary:"#606060",
  accent:"#FFFFFF", accentMuted:"rgba(255,255,255,0.08)",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)",
  red:"#EF4444",   redBg:"rgba(239,68,68,0.1)",
  blue:"#3B82F6",  blueBg:"rgba(59,130,246,0.1)",
  gold:"#F59E0B",  goldBg:"rgba(245,158,11,0.1)",
};
const LIGHT = {
  bg:"#FAFAFA", surface:"#FFFFFF", surfaceHover:"#F5F5F5",
  border:"#E8E8E8", borderLight:"#F0F0F0",
  text:"#0A0A0A", textSecondary:"#606060", textTertiary:"#A0A0A0",
  accent:"#000000", accentMuted:"rgba(0,0,0,0.06)",
  green:"#16A34A", greenBg:"rgba(22,163,74,0.08)",
  red:"#DC2626",   redBg:"rgba(220,38,38,0.08)",
  blue:"#2563EB",  blueBg:"rgba(37,99,235,0.08)",
  gold:"#D97706",  goldBg:"rgba(217,119,6,0.08)",
};

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────
const DEFAULT_INCOME = [
  { id:"sal", label:"Nómina", amount:1800 },
];
const DEFAULT_LOANS = [
  { id:"l1", label:"Préstamo 1", principal:1000, rate:15, borrower:"Prestatario 1", startDate:"2026-01-01", status:"active" },
  { id:"l2", label:"Préstamo 2", principal:1000, rate:15, borrower:"Prestatario 2", startDate:"2026-02-01", status:"active" },
  { id:"l3", label:"Préstamo 3", principal:1000, rate:15, borrower:"Prestatario 3", startDate:"2026-03-01", status:"active" },
];
const DEFAULT_EXPENSES = [
  { id:"alq",    label:"Alquiler",            amount:200, cat:"vivienda"     },
  { id:"merc",   label:"Mercadona",            amount:150, cat:"alimentación" },
  { id:"carne",  label:"Carne y huevos",       amount:150, cat:"alimentación" },
  { id:"dental", label:"Alineadores dentales", amount:260, cat:"salud"        },
  { id:"bbvap",  label:"Cuota BBVA",           amount:125, cat:"deuda"        },
  { id:"tiop",   label:"Interés tío",          amount:85,  cat:"deuda"        },
  { id:"wifi",   label:"WiFi",                 amount:100, cat:"fijo"         },
  { id:"gym",    label:"Gym",                  amount:50,  cat:"salud"        },
  { id:"prot",   label:"Proteína",             amount:50,  cat:"salud"        },
  { id:"vit",    label:"Vitaminas",            amount:30,  cat:"salud"        },
  { id:"bic",    label:"Bicing",               amount:30,  cat:"transporte"   },
  { id:"pelu",   label:"Peluquería",           amount:45,  cat:"personal"     },
  { id:"subs",   label:"Suscripciones",        amount:30,  cat:"ocio"         },
  { id:"glov",   label:"Glovo / extras",       amount:30,  cat:"ocio"         },
];
const DEFAULT_DEBTS = [
  { id:"tio",  label:"Tío",  total:8500, rate:1,   type:"interest-only", monthlyPayment:85  },
  { id:"bbva", label:"BBVA", total:8000, rate:0.6, type:"amortizing",    monthlyPayment:125 },
];
const DEFAULT_FRIEND_LOANS = [];
const DEFAULT_ACCOUNTS = [
  {id:"acc1", label:"Cuenta principal", type:"banco",    amount:0},
  {id:"acc2", label:"Efectivo",         type:"efectivo", amount:0},
];

const DEFAULT_GOALS = [
  { id:"g1", label:"Carnet de coche",          target:1800,  saved:0, priority:"alta",  monthlyContrib:200 },
  { id:"g2", label:"Colchón emergencia (3m)",  target:5400,  saved:0, priority:"alta",  monthlyContrib:150 },
  { id:"g3", label:"Ampliar cartera préstamos",target:10000, saved:0, priority:"media", monthlyContrib:100 },
  { id:"g4", label:"Entrada piso / hipoteca",  target:30000, saved:0, priority:"baja",  monthlyContrib:50  },
];

const PRIORITY_META = {
  alta:  { label:"Alta",  color:"#EF4444", bg:"rgba(239,68,68,0.12)"  },
  media: { label:"Media", color:"#F59E0B", bg:"rgba(245,158,11,0.12)" },
  baja:  { label:"Baja",  color:"#3B82F6", bg:"rgba(59,130,246,0.12)" },
};
const PRIORITY_ORDER = { alta:0, media:1, baja:2 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const eur = (n) => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);

// ─── UI ───────────────────────────────────────────────────────────────────────
const Card  = ({children,t,style={}}) => <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"16px",padding:"1rem",...style}}>{children}</div>;
const Lbl   = ({children,t})         => <div style={{color:t.textTertiary,fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.35rem"}}>{children}</div>;
const Inp   = ({value,onChange,placeholder,type="text",t,style={}}) =>
  <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{background:t.surfaceHover,border:`1px solid ${t.border}`,borderRadius:"10px",color:t.text,padding:"0.5rem 0.75rem",fontSize:"0.82rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box",...style}}/>;
const Sel   = ({value,onChange,children,t,style={}}) =>
  <select value={value} onChange={onChange} style={{background:t.surfaceHover,border:`1px solid ${t.border}`,borderRadius:"10px",color:t.text,padding:"0.5rem 0.75rem",fontSize:"0.82rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box",...style}}>{children}</select>;

function ProgBar({value,max,color,t,height=5}) {
  const pct=Math.min(100,(value/(max||1))*100);
  return <div style={{background:t.border,borderRadius:99,height,overflow:"hidden"}}><div style={{width:pct+"%",background:color,height:"100%",borderRadius:99,transition:"width 0.3s"}}/></div>;
}
function AccountEditRow({a,t,saveEdit,setEditing}){
  const [editD,setEditD]=useState({label:a.label,type:a.type,amount:a.amount});
  return(
    <div key={a.id} style={{display:"flex",gap:"0.35rem",alignItems:"center",flexWrap:"wrap",padding:"0.5rem",background:t.surfaceHover,borderRadius:"10px"}}>
      <Inp value={editD.label} onChange={e=>setEditD(p=>({...p,label:e.target.value}))} t={t} style={{flex:2,minWidth:"7rem"}} placeholder="Nombre"/>
      <Sel value={editD.type} onChange={e=>setEditD(p=>({...p,type:e.target.value}))} t={t} style={{flex:1}}>
        {ACC_TYPES.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
      </Sel>
      <Inp type="number" value={editD.amount} onChange={e=>setEditD(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1,minWidth:"5rem"}} placeholder="€"/>
      <SmBtn onClick={()=>saveEdit(a.id,editD)} t={t} color={t.green}>✓</SmBtn>
      <SmBtn onClick={()=>setEditing(null)} t={t}>✕</SmBtn>
    </div>
  );
}
function SmBtn({onClick,children,t,color}) {
  return <button onClick={onClick} style={{background:"none",border:`1px solid ${color||t.border}`,borderRadius:"8px",padding:"0.3rem 0.55rem",color:color||t.textTertiary,fontSize:"0.7rem",cursor:"pointer",fontFamily:"inherit"}}>{children}</button>;
}
function PrimBtn({onClick,children,t}) {
  return <button onClick={onClick} style={{background:t.accent,border:"none",borderRadius:"9px",padding:"0.5rem 1rem",color:t.bg,fontSize:"0.78rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{children}</button>;
}

// ─── LINE CHART ───────────────────────────────────────────────────────────────
function LineChart({data,t,color,height=120}) {
  if(!data||data.length<2) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:t.textTertiary,fontSize:"0.72rem"}}>Sin historial aún</div>;
  const W=360,H=height;
  const vals=data.map(d=>d.y);
  const minV=Math.min(...vals),maxV=Math.max(...vals);
  const range=maxV-minV||1;
  const px=(i)=>(i/(data.length-1))*(W-40)+20;
  const py=(v)=>H-16-((v-minV)/range)*(H-32);
  const pts=data.map((d,i)=>[px(i),py(d.y)]);
  let path=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){const cx=(pts[i-1][0]+pts[i][0])/2;path+=` C${cx} ${pts[i-1][1]} ${cx} ${pts[i][1]} ${pts[i][0]} ${pts[i][1]}`;}
  const area=path+` L${pts[pts.length-1][0]} ${H-4} L${pts[0][0]} ${H-4} Z`;
  const uid=`lc${color.replace("#","")}${data.length}`;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      {[0,0.5,1].map((fr,i)=>{const y=py(minV+fr*range);return<g key={i}><line x1={20} y1={y} x2={W-20} y2={y} stroke={t.border} strokeWidth="1"/><text x={16} y={y+4} fill={t.textTertiary} fontSize="8" textAnchor="end">{eur(minV+fr*range)}</text></g>;})}
      <path d={area} fill={`url(#${uid})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"/>
      {data.map((d,i)=>(i===0||i===data.length-1||i%Math.ceil(data.length/4)===0)&&<text key={i} x={pts[i][0]} y={H-1} fill={t.textTertiary} fontSize="8" textAnchor="middle">{d.x}</text>)}
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
      <text x={pts[pts.length-1][0]} y={pts[pts.length-1][1]-6} fill={color} fontSize="9" textAnchor="middle">{eur(vals[vals.length-1])}</text>
    </svg>
  );
}

// ─── VIBRANT PALETTE ──────────────────────────────────────────────────────────
const VIB = ["#FF6B6B","#4ECDC4","#45B7D1","#FFEAA7","#C39BD3","#96CEB4","#F7DC6F","#82E0AA","#F0B27A","#F8A5C2","#6C5CE7","#00B894"];
const CAT_COLORS = {vivienda:"#45B7D1",alimentación:"#00B894",salud:"#C39BD3",deuda:"#FF6B6B",fijo:"#74B9FF",transporte:"#FFEAA7",personal:"#F0B27A",ocio:"#F8A5C2"};

// ─── INTERACTIVE DONUT ────────────────────────────────────────────────────────
function InteractiveDonut({slices,size=150,t,subtitle}) {
  const [sel,setSel]=useState(null);
  const total=slices.reduce((s,sl)=>s+sl.value,0);
  if(!total) return <div style={{height:size,display:"flex",alignItems:"center",justifyContent:"center",color:t.textTertiary,fontSize:"0.72rem"}}>Sin datos</div>;
  let angle=-Math.PI/2;
  const R=size/2-14,cx=size/2,cy=size/2;
  const paths=slices.map((sl,i)=>{
    const a=(sl.value/total)*2*Math.PI;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    angle+=a;
    const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);
    return{d:`M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${a>Math.PI?1:0} 1 ${x2} ${y2} Z`,color:sl.color,label:sl.label,value:sl.value,pct:((sl.value/total)*100).toFixed(0),idx:i};
  });
  const active=sel!==null?paths[sel]:null;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.8rem"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block",cursor:"pointer",filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.15))"}}>
        {paths.map((p,i)=>(
          <path key={i} d={p.d} fill={p.color} stroke={t.bg} strokeWidth="2.5"
            style={{opacity:sel===null||sel===i?1:0.35,transform:sel===i?`translate(${Math.cos(angle)*3}px,${Math.sin(angle)*3}px)`:"none",transition:"opacity 0.2s",cursor:"pointer"}}
            onMouseEnter={()=>setSel(i)} onMouseLeave={()=>setSel(null)} onClick={()=>setSel(sel===i?null:i)}/>
        ))}
        <circle cx={cx} cy={cy} r={R*0.54} fill={t.surface}/>
        {active?(
          <>
            <text x={cx} y={cy-7} textAnchor="middle" fill={active.color} fontSize="13" fontWeight="800">{eur(active.value)}</text>
            <text x={cx} y={cy+7} textAnchor="middle" fill={t.textSecondary} fontSize="8.5" fontWeight="600">{active.label}</text>
            <text x={cx} y={cy+18} textAnchor="middle" fill={t.textTertiary} fontSize="7.5">{active.pct}%</text>
          </>
        ):(
          <>
            <text x={cx} y={cy-4} textAnchor="middle" fill={t.text} fontSize="13" fontWeight="800">{eur(total)}</text>
            <text x={cx} y={cy+10} textAnchor="middle" fill={t.textTertiary} fontSize="7.5">{subtitle}</text>
          </>
        )}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:"0.28rem",width:"100%"}}>
        {slices.map((sl,i)=>(
          <div key={i} onMouseEnter={()=>setSel(i)} onMouseLeave={()=>setSel(null)} onClick={()=>setSel(sel===i?null:i)}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.22rem 0.4rem",borderRadius:"7px",cursor:"pointer",
              background:sel===i?sl.color+"28":"transparent",opacity:sel===null||sel===i?1:0.45,transition:"all 0.15s"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
              <div style={{width:9,height:9,borderRadius:3,background:sl.color,flexShrink:0}}/>
              <span style={{fontSize:"0.7rem",color:t.textSecondary,fontWeight:sel===i?700:400}}>{sl.label}</span>
            </div>
            <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
              <span style={{fontSize:"0.72rem",fontWeight:700,color:sel===i?sl.color:t.text}}>{eur(sl.value)}</span>
              <span style={{fontSize:"0.6rem",color:t.textTertiary,minWidth:"2.5rem",textAlign:"right"}}>{((sl.value/total)*100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
const PIN_CORRECT = "5129";
function PinScreen({onUnlock,t}) {
  const [digits,setDigits]=useState("");
  const [shake,setShake]=useState(false);

  const handleDigit=(d)=>{
    if(digits.length>=4) return;
    const next=digits+d;
    setDigits(next);
    if(next.length===4){
      if(next===PIN_CORRECT){
        supabase.auth.signInWithPassword({email:"thewolf536@gmail.com",password:"ElGuesoPara27YT"})
          .then(({error})=>{
            if(!error){
              localStorage.setItem("fz_pin_v1","ok");
              onUnlock();
            } else {
              setShake(true);
              setTimeout(()=>{setDigits("");setShake(false);},600);
            }
          });
      } else {
        setShake(true);
        setTimeout(()=>{setDigits("");setShake(false);},600);
      }
    }
  };
  const del=()=>setDigits(p=>p.slice(0,-1));

  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2rem",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"1.5rem",fontWeight:800,color:t.text,letterSpacing:"-0.03em"}}>Finanzas</div>
        <div style={{fontSize:"0.7rem",color:t.textTertiary,marginTop:"0.2rem"}}>Introduce tu PIN</div>
      </div>
      <div style={{display:"flex",gap:"1rem",transition:"transform 0.1s",transform:shake?"translateX(0)":"none",animation:shake?"shake 0.4s ease":"none"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${t.border}`,background:digits.length>i?t.text:"transparent",transition:"background 0.15s"}}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem"}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
          <button key={i} onClick={()=>k==="⌫"?del():k!==""&&handleDigit(String(k))}
            disabled={k===""}
            style={{width:70,height:70,borderRadius:"50%",border:`1px solid ${t.border}`,background:k===""?"transparent":t.surface,color:t.text,fontSize:k==="⌫"?"1.2rem":"1.4rem",fontWeight:600,cursor:k===""?"default":"pointer",fontFamily:"inherit",opacity:k===""?0:1}}>
            {k}
          </button>
        ))}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}

// ─── RESUMEN TAB ──────────────────────────────────────────────────────────────
// ─── SPARKLINE (mini line for stat cards) ────────────────────────────────────
function Spark({data,color,height=32}) {
  if(!data||data.length<2) return <div style={{height}}/>;
  const W=120,H=height;
  const vals=data.map(d=>d.y);
  const minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
  const px=(i)=>(i/(data.length-1))*(W-4)+2;
  const py=(v)=>H-2-((v-minV)/range)*(H-4);
  const pts=data.map((d,i)=>[px(i),py(d.y)]);
  let path=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=1;i<pts.length;i++){const cx=(pts[i-1][0]+pts[i][0])/2;path+=` C${cx} ${pts[i-1][1]} ${cx} ${pts[i][1]} ${pts[i][0]} ${pts[i][1]}`;}
  return(
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.7"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={color}/>
    </svg>
  );
}

function ResumenTab({income,expenses,loans,debts,goals,payments,capital,monthlyHistory,t,wide=false}) {
  const [donutTab,setDonutTab]=useState("gastos");
  const thisMonth    = mk();
  const paid         = payments[thisMonth]||{};
  const totalIncome  = income.reduce((s,i)=>s+i.amount,0);
  const loanIncome   = loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal*(l.rate/100),0);
  const totalExp     = expenses.reduce((s,e)=>s+e.amount,0);
  const paidTotal    = expenses.filter(e=>paid[e.id]).reduce((s,e)=>s+e.amount,0);
  const totalDebt    = debts.reduce((s,d)=>s+d.total,0);
  const pendingCount = expenses.filter(e=>!paid[e.id]).length;
  const loanCapital  = loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal,0);
  const patrimonioNeto = capital + loanCapital - totalDebt;

  // ── DONUT DATA ──
  const cats={};expenses.forEach(e=>{cats[e.cat]=(cats[e.cat]||0)+e.amount;});
  const gastosSlices=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>({label:cat,value:val,color:CAT_COLORS[cat]||VIB[7]}));

  const ingresosSlices=[
    ...(totalIncome>0?[{label:"Nómina / fijos",value:totalIncome,color:"#4ECDC4"}]:[]),
    ...(loanIncome>0?[{label:"Intereses préstamos",value:loanIncome,color:"#45B7D1"}]:[]),
  ];

  const ahorrosSlices=goals.filter(g=>g.saved>0).map((g,i)=>({label:g.label,value:g.saved,color:VIB[i%VIB.length]}));

  // History sparklines
  const histKeys=Object.keys(monthlyHistory||{}).sort();
  const capSpark=histKeys.map(k=>({x:k,y:monthlyHistory[k].capital||0}));
  const loanSpark=histKeys.map(k=>({x:k,y:monthlyHistory[k].loanIncome||0}));

  // ── TOP STAT CARDS ──
  const statCards=[
    {
      label:"Capital disponible", val:eur(capital), sub:`${eur(paidTotal)} pagado este mes`,
      color:capital>=0?t.text:t.red, spark:capSpark, sparkColor:"#45B7D1",
      badge:`${expenses.filter(e=>paid[e.id]).length}/${expenses.length} pagos`, badgeColor:"#45B7D1",
    },
    {
      label:"Intereses préstamos", val:eur(loanIncome)+"/mes", sub:`${eur(loanCapital)} capital prestado`,
      color:"#4ECDC4", spark:loanSpark, sparkColor:"#4ECDC4",
      badge:"cartera activa", badgeColor:"#4ECDC4",
    },
    {
      label:"Patrimonio neto", val:eur(patrimonioNeto), sub:`capital + préstamos − deudas`,
      color:patrimonioNeto>=0?"#00B894":"#FF6B6B", spark:capSpark, sparkColor:"#00B894",
      badge:patrimonioNeto>=0?"▲ positivo":"▼ negativo", badgeColor:patrimonioNeto>=0?"#00B894":"#FF6B6B",
    },
  ];

  const DONUT_TABS=[{id:"gastos",label:"Gastos",slices:gastosSlices,subtitle:"este mes"},{id:"ingresos",label:"Ingresos",slices:ingresosSlices,subtitle:"mensuales"},{id:"ahorros",label:"Ahorros",slices:ahorrosSlices,subtitle:"acumulado"}];
  const activeDonut=DONUT_TABS.find(d=>d.id===donutTab);

  if (wide) {
    // ── DESKTOP DASHBOARD LAYOUT ──
    return(
      <div style={{display:"flex",flexDirection:"column",gap:"1.2rem"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"0.62rem",color:t.textTertiary,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:"0.3rem"}}>
              {new Date().toLocaleDateString("es-ES",{month:"long",year:"numeric"})}
            </div>
            <div style={{fontSize:"1.7rem",fontWeight:800,color:t.text,letterSpacing:"-0.03em"}}>Resumen</div>
          </div>
          <div style={{fontSize:"0.7rem",color:t.textTertiary}}>{pendingCount>0?`${pendingCount} pagos pendientes`:"Todos los pagos al día ✓"}</div>
        </div>

        {/* Row 1: 3 stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem"}}>
          {statCards.map(sc=>(
            <div key={sc.label} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"18px",padding:"1.1rem",display:"flex",flexDirection:"column",gap:"0.4rem"}}>
              <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary}}>{sc.label}</div>
              <div style={{fontSize:"1.7rem",fontWeight:800,color:sc.color,letterSpacing:"-0.02em",lineHeight:1}}>{sc.val}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:"0.1rem"}}>
                <div>
                  <div style={{fontSize:"0.63rem",color:t.textTertiary}}>{sc.sub}</div>
                  <div style={{display:"inline-block",marginTop:"0.3rem",padding:"0.14rem 0.48rem",background:sc.badgeColor+"20",borderRadius:99,fontSize:"0.59rem",fontWeight:700,color:sc.badgeColor}}>{sc.badge}</div>
                </div>
                {sc.spark.length>=2&&<Spark data={sc.spark} color={sc.sparkColor} height={30}/>}
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: 3 interactive donuts */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem"}}>
          {DONUT_TABS.map(dt=>(
            <div key={dt.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"18px",padding:"1.2rem"}}>
              <div style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"1rem"}}>{dt.label}</div>
              <InteractiveDonut slices={dt.slices} size={160} t={t} subtitle={dt.subtitle}/>
            </div>
          ))}
        </div>

        {/* Row 3: Pagos del mes */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"18px",padding:"1.2rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary}}>Pagos del mes · {new Date().toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</div>
            <div style={{display:"flex",gap:"1rem",fontSize:"0.75rem"}}>
              <span style={{color:"#00B894",fontWeight:700}}>{eur(paidTotal)} pagado</span>
              {pendingCount>0&&<span style={{color:"#FFEAA7",fontWeight:700}}>{eur(totalExp-paidTotal)} pendiente</span>}
            </div>
          </div>
          <ProgBar value={paidTotal} max={totalExp} color="#00B894" t={t} height={6}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.5rem",marginTop:"1rem"}}>
            {expenses.map(e=>{
              const isPaid=!!paid[e.id];
              return(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.4rem 0.6rem",borderRadius:"10px",
                  background:isPaid?"#00B89410":t.surfaceHover,border:`1px solid ${isPaid?"#00B89430":t.border}`,opacity:isPaid?0.6:1}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:isPaid?"#00B894":t.textTertiary,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.68rem",color:t.text,textDecoration:isPaid?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.label}</div>
                    <div style={{fontSize:"0.6rem",color:isPaid?"#00B894":t.textTertiary,fontWeight:600}}>{eur(e.amount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE LAYOUT ──
  // eslint-disable-next-line no-unused-vars
  const profit = totalIncome + loanIncome - totalExp;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>

      {/* HERO: Capital disponible */}
      <div>
        <Lbl t={t}>{new Date().toLocaleDateString("es-ES",{month:"long",year:"numeric"})}</Lbl>
        <div style={{fontSize:"2.2rem",fontWeight:800,color:capital>=0?t.text:t.red,letterSpacing:"-0.03em",lineHeight:1}}>{eur(capital)}</div>
        <div style={{color:t.textTertiary,fontSize:"0.65rem",marginTop:"0.15rem"}}>capital disponible</div>
      </div>

      {/* STATS COMPACTOS: 2 en fila */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.45rem"}}>
        <Card t={t} style={{padding:"0.55rem 0.6rem"}}>
          <Lbl t={t}>Ingresos</Lbl>
          <div style={{fontSize:"0.88rem",fontWeight:700,color:t.green}}>{eur(totalIncome+loanIncome)}</div>
          <div style={{fontSize:"0.58rem",color:t.textTertiary,marginTop:"0.1rem"}}>/mes</div>
        </Card>
        <Card t={t} style={{padding:"0.55rem 0.6rem"}}>
          <Lbl t={t}>Gastos</Lbl>
          <div style={{fontSize:"0.88rem",fontWeight:700,color:t.red}}>{eur(totalExp)}</div>
          <div style={{fontSize:"0.58rem",color:t.textTertiary,marginTop:"0.1rem"}}>/mes</div>
        </Card>
      </div>

      {/* PAGOS DEL MES — compact */}
      <Card t={t} style={{padding:"0.7rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.35rem"}}>
          <Lbl t={t}>Pagos del mes</Lbl>
          <span style={{fontSize:"0.62rem",color:pendingCount?"#FFEAA7":"#00B894",fontWeight:600}}>{pendingCount?`${pendingCount} pendientes`:"Todo al día ✓"}</span>
        </div>
        <ProgBar value={paidTotal} max={totalExp} color="#00B894" t={t} height={5}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.3rem",fontSize:"0.62rem",color:t.textTertiary}}>
          <span style={{color:"#00B894",fontWeight:600}}>{eur(paidTotal)} pagado</span>
          <span>{expenses.filter(e=>paid[e.id]).length}/{expenses.length} gastos</span>
          <span>{eur(totalExp-paidTotal)} pendiente</span>
        </div>
      </Card>

      {/* PROGRESO MENSUAL — historial + donut */}
      <Card t={t}>
        <Lbl t={t}>Progreso mensual</Lbl>
        {/* Cabecera columnas */}
        <div style={{display:"grid",gridTemplateColumns:"3rem 1fr 1fr 1fr",gap:"0.3rem",padding:"0.2rem 0.4rem",marginBottom:"0.2rem"}}>
          {["","Ingresos","Gastos","Profit"].map(h=>(
            <span key={h} style={{fontSize:"0.56rem",color:t.textTertiary,fontWeight:700,textAlign:"right",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</span>
          ))}
        </div>
        {/* Mes actual */}
        {(()=>{
          const currentProfit = totalIncome + loanIncome - totalExp;
          return(
            <div style={{display:"grid",gridTemplateColumns:"3rem 1fr 1fr 1fr",gap:"0.3rem",alignItems:"center",padding:"0.3rem 0.4rem",background:t.accentMuted,borderRadius:"8px",marginBottom:"0.2rem",fontSize:"0.68rem"}}>
              <span style={{color:t.text,fontWeight:700}}>Ahora</span>
              <span style={{color:t.green,fontWeight:700,textAlign:"right"}}>{eur(totalIncome+loanIncome)}</span>
              <span style={{color:t.red,fontWeight:600,textAlign:"right"}}>{eur(totalExp)}</span>
              <span style={{color:currentProfit>=0?"#00B894":"#FF6B6B",fontWeight:700,textAlign:"right"}}>{currentProfit>=0?"+":""}{eur(currentProfit)}</span>
            </div>
          );
        })()}
        {/* Historial meses anteriores */}
        {histKeys.length>0?(
          <div style={{display:"flex",flexDirection:"column",gap:"0.15rem",marginBottom:"0.75rem"}}>
            {histKeys.slice(-4).reverse().map(k=>{
              const h=monthlyHistory[k];
              const p=(h.totalIncome||0)+(h.loanIncome||0)-(h.totalExp||0);
              return(
                <div key={k} style={{display:"grid",gridTemplateColumns:"3rem 1fr 1fr 1fr",gap:"0.3rem",alignItems:"center",padding:"0.25rem 0.4rem",background:t.surfaceHover,borderRadius:"7px",fontSize:"0.65rem"}}>
                  <span style={{color:t.textTertiary}}>{k.slice(5)}</span>
                  <span style={{color:t.green,fontWeight:600,textAlign:"right"}}>{eur(h.totalIncome||0)}</span>
                  <span style={{color:t.red,fontWeight:600,textAlign:"right"}}>{eur(h.totalExp||0)}</span>
                  <span style={{color:p>=0?"#00B894":"#FF6B6B",fontWeight:700,textAlign:"right"}}>{p>=0?"+":""}{eur(p)}</span>
                </div>
              );
            })}
          </div>
        ):(
          <div style={{fontSize:"0.65rem",color:t.textTertiary,marginBottom:"0.75rem",padding:"0.3rem 0"}}>El historial se acumula mes a mes automáticamente.</div>
        )}
        {/* Donut ingresos vs gastos mes actual */}
        <InteractiveDonut
          slices={[
            ...(totalIncome>0?[{label:"Nómina",value:totalIncome,color:"#00B894"}]:[]),
            ...(loanIncome>0?[{label:"Intereses",value:loanIncome,color:"#4ECDC4"}]:[]),
            {label:"Gastos fijos",value:totalExp,color:"#FF6B6B"},
          ].filter(s=>s.value>0)}
          size={160} t={t} subtitle="ingresos vs gastos"/>
      </Card>

      {/* DONUTS INTERACTIVOS — Gastos / Ingresos / Ahorros */}
      <Card t={t}>
        <div style={{display:"flex",gap:"2px",background:t.surfaceHover,borderRadius:"10px",padding:"3px",marginBottom:"0.85rem"}}>
          {DONUT_TABS.map(dt=>(
            <button key={dt.id} onClick={()=>setDonutTab(dt.id)}
              style={{flex:1,padding:"0.35rem 0",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.7rem",fontWeight:donutTab===dt.id?700:500,
                background:donutTab===dt.id?t.surface:"transparent",color:donutTab===dt.id?t.text:t.textTertiary,transition:"all 0.15s",fontFamily:"inherit"}}>
              {dt.label}
            </button>
          ))}
        </div>
        {activeDonut&&<InteractiveDonut slices={activeDonut.slices} size={170} t={t} subtitle={activeDonut.subtitle}/>}
      </Card>
    </div>
  );
}

// ─── INGRESOS TAB ─────────────────────────────────────────────────────────────
function IngresosTab({income,setIncome,loans,setLoans,expenses,payments,loanPayments,setLoanPayments,capital,setCapital,friendLoans,setFriendLoans,loanCollectionLog,setLoanCollectionLog,accounts,setAccounts,t}) {
  const [addingInc,    setAddingInc]    = useState(false);
  const [addingLoan,   setAddingLoan]   = useState(false);
  const [incForm,      setIncForm]      = useState({label:"",amount:""});
  const [loanForm,     setLoanForm]     = useState({label:"",principal:"",rate:15,borrower:"",startDate:today()});
  const [editIncId,    setEditIncId]    = useState(null);
  const [editIncAmt,   setEditIncAmt]   = useState("");
  const [editLoanId,   setEditLoanId]   = useState(null);
  const [editLoan,     setEditLoan]     = useState({});
  const [collectDates, setCollectDates] = useState({});

  const activeLoans = loans.filter(l=>l.status!=="inactive");
  const loanIncome  = activeLoans.reduce((s,l)=>s+l.principal*(l.rate/100),0);
  const loanCapital = activeLoans.reduce((s,l)=>s+l.principal,0);
  const totalIncome = income.reduce((s,i)=>s+i.amount,0);
  const thisMonth   = mk();
  const paid        = payments[thisMonth]||{};
  const monthLP     = loanPayments[thisMonth]||{};
  const paidTotal   = expenses.filter(e=>paid[e.id]).reduce((s,e)=>s+e.amount,0);
  const uncollected = activeLoans.filter(l=>!monthLP[l.id]);
  const collectedIncome = activeLoans.filter(l=>monthLP[l.id]).reduce((s,l)=>s+l.principal*(l.rate/100),0);

  const getDate = (id) => collectDates[id]||today();

  const collectLoan = (l) => {
    const amount = l.principal*(l.rate/100);
    const date   = getDate(l.id);
    // Always log the collection
    setLoanCollectionLog(p=>[...p,{loanId:l.id,loanLabel:l.label,amount,date}]);
    // Mark as collected this month (for stats indicator)
    setLoanPayments(p=>({...p,[thisMonth]:{...(p[thisMonth]||{}),[l.id]:{date,amount}}}));
    setCapital(v=>v+amount);
  };
  const uncollectLoan = (l) => {
    const prev = monthLP[l.id];
    if(!prev) return;
    // Remove last log entry for this loan
    setLoanCollectionLog(p=>{
      const idx=[...p].map((e,i)=>e.loanId===l.id?i:-1).filter(i=>i>=0);
      if(idx.length===0) return p;
      const last=idx[idx.length-1];
      return p.filter((_,i)=>i!==last);
    });
    setLoanPayments(p=>{const m={...(p[thisMonth]||{})};delete m[l.id];return{...p,[thisMonth]:m};});
    setCapital(v=>v-prev.amount);
  };
  const collectAll = () => {
    uncollected.forEach(l=>collectLoan(l));
  };

  const addInc = () => {
    if (!incForm.label||!incForm.amount) return;
    setIncome(p=>[...p,{id:Date.now().toString(),label:incForm.label,amount:+incForm.amount}]);
    setIncForm({label:"",amount:""});setAddingInc(false);
  };
  const addLoan = () => {
    if (!loanForm.label||!loanForm.principal) return;
    setLoans(p=>[...p,{id:Date.now().toString(),...loanForm,principal:+loanForm.principal,rate:+loanForm.rate,status:"active"}]);
    setLoanForm({label:"",principal:"",rate:15,borrower:"",startDate:today()});setAddingLoan(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
      <div>
        <Lbl t={t}>Ingresos totales mensuales</Lbl>
        <div style={{fontSize:"2.4rem",fontWeight:800,color:t.green,letterSpacing:"-0.03em",lineHeight:1}}>{eur(totalIncome+loanIncome)}</div>
        <div style={{color:t.textTertiary,fontSize:"0.7rem",marginTop:"0.2rem"}}>{eur(totalIncome)} nómina + {eur(loanIncome)} intereses</div>
      </div>

      {/* Capital disponible */}
      <Card t={t}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <Lbl t={t}>Capital disponible</Lbl>
            <div style={{fontSize:"1.9rem",fontWeight:800,color:capital>=0?t.text:t.red,letterSpacing:"-0.02em"}}>{eur(capital)}</div>
            <div style={{fontSize:"0.68rem",color:t.textTertiary,marginTop:"0.2rem"}}>se reduce al confirmar pagos en Gastos</div>
          </div>
          <SmBtn onClick={()=>{const v=window.prompt("Capital actual (€):",capital);if(v!==null&&!isNaN(+v))setCapital(+v);}} t={t}>Ajustar</SmBtn>
        </div>
        <div style={{height:"1px",background:t.border,margin:"0.75rem 0"}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",fontSize:"0.72rem"}}>
          <div>
            <div style={{color:t.textTertiary,marginBottom:"0.2rem"}}>Pagado este mes</div>
            <div style={{fontWeight:600,color:t.red}}>{eur(paidTotal)}</div>
          </div>
          <div>
            <div style={{color:t.textTertiary,marginBottom:"0.2rem"}}>Cobrado préstamos</div>
            <div style={{fontWeight:600,color:t.green}}>{eur(collectedIncome)}</div>
          </div>
        </div>
        <div style={{marginTop:"0.75rem"}}>
          <button onClick={()=>setCapital(v=>v+totalIncome)}
            style={{width:"100%",background:t.greenBg,border:`1px solid ${t.green}44`,borderRadius:"9px",padding:"0.55rem",color:t.green,fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>
            + Recibir nómina {eur(totalIncome)}
          </button>
        </div>
      </Card>

      {/* Nómina + otros ingresos */}
      <Card t={t}>
        <Lbl t={t}>Ingresos fijos</Lbl>
        {income.map(item=>(
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.65rem"}}>
            <div style={{flex:1,fontSize:"0.85rem",color:t.text}}>{item.label}</div>
            {editIncId===item.id?(
              <div style={{display:"flex",gap:"0.35rem",alignItems:"center"}}>
                <Inp type="number" value={editIncAmt} onChange={e=>setEditIncAmt(e.target.value)} t={t} style={{width:"5.5rem"}}/>
                <SmBtn onClick={()=>{setIncome(p=>p.map(i=>i.id===item.id?{...i,amount:+editIncAmt}:i));setEditIncId(null);}} t={t} color={t.green}>✓</SmBtn>
                <SmBtn onClick={()=>setEditIncId(null)} t={t}>✕</SmBtn>
              </div>
            ):(
              <>
                <span style={{fontSize:"0.95rem",fontWeight:600,color:t.text}}>{eur(item.amount)}</span>
                <SmBtn onClick={()=>{setEditIncId(item.id);setEditIncAmt(item.amount);}} t={t}>Editar</SmBtn>
                {item.id!=="sal"&&<SmBtn onClick={()=>setIncome(p=>p.filter(i=>i.id!==item.id))} t={t} color={t.red}>✕</SmBtn>}
              </>
            )}
          </div>
        ))}
        {addingInc?(
          <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap",marginTop:"0.3rem"}}>
            <Inp placeholder="Concepto" value={incForm.label} onChange={e=>setIncForm(p=>({...p,label:e.target.value}))} t={t} style={{flex:2,minWidth:"8rem"}}/>
            <Inp placeholder="€/mes" type="number" value={incForm.amount} onChange={e=>setIncForm(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1,minWidth:"5rem"}}/>
            <PrimBtn onClick={addInc} t={t}>Añadir</PrimBtn>
            <SmBtn onClick={()=>setAddingInc(false)} t={t}>Cancelar</SmBtn>
          </div>
        ):(
          <SmBtn onClick={()=>setAddingInc(true)} t={t}>+ Nueva fuente</SmBtn>
        )}
      </Card>

      {/* Cartera préstamos */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <Lbl t={t}>Cartera de préstamos</Lbl>
          <div style={{fontSize:"0.9rem",color:t.textSecondary}}>{eur(loanCapital)} prestados · <span style={{color:t.green,fontWeight:700}}>{eur(loanIncome)}/mes</span></div>
        </div>
        {uncollected.length>0&&(
          <button onClick={collectAll} style={{background:t.greenBg,border:`1px solid ${t.green}44`,borderRadius:"9px",padding:"0.4rem 0.7rem",color:t.green,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Cobrar todos ({uncollected.length})
          </button>
        )}
      </div>

      {/* Loans grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem"}}>
        {loans.map(l=>{
          const monthly=l.principal*(l.rate/100);
          const isCollected=!!monthLP[l.id];
          const isInactive=l.status==="inactive";

          if(editLoanId===l.id) return(
            <Card key={l.id} t={t} style={{gridColumn:"span 2"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
                <Inp placeholder="Concepto" value={editLoan.label} onChange={e=>setEditLoan(p=>({...p,label:e.target.value}))} t={t}/>
                <Inp placeholder="Prestatario" value={editLoan.borrower} onChange={e=>setEditLoan(p=>({...p,borrower:e.target.value}))} t={t}/>
                <Inp type="number" placeholder="Capital €" value={editLoan.principal} onChange={e=>setEditLoan(p=>({...p,principal:e.target.value}))} t={t}/>
                <Inp type="number" placeholder="Tasa %/mes" value={editLoan.rate} onChange={e=>setEditLoan(p=>({...p,rate:e.target.value}))} t={t}/>
              </div>
              <div style={{display:"flex",gap:"0.35rem"}}>
                <PrimBtn onClick={()=>{setLoans(p=>p.map(x=>x.id===l.id?{...x,...editLoan,principal:+editLoan.principal,rate:+editLoan.rate}:x));setEditLoanId(null);}} t={t}>Guardar</PrimBtn>
                <SmBtn onClick={()=>setEditLoanId(null)} t={t}>Cancelar</SmBtn>
              </div>
            </Card>
          );

          return(
            <Card key={l.id} t={t} style={{opacity:isInactive?0.4:1}}>
              <div style={{marginBottom:"0.4rem"}}>
                <div style={{fontSize:"0.85rem",fontWeight:600,color:t.text}}>{l.label}</div>
                <div style={{fontSize:"0.65rem",color:t.textTertiary}}>{l.borrower||"—"}</div>
              </div>
              <div style={{marginBottom:"0.25rem"}}>
                <div style={{fontSize:"1.1rem",fontWeight:700,color:t.text}}>{eur(l.principal)}</div>
                <div style={{fontSize:"0.7rem",color:t.textTertiary}}>{l.rate}%/mes</div>
              </div>
              <div style={{fontSize:"0.85rem",fontWeight:700,color:isCollected?t.textTertiary:t.green,marginBottom:"0.5rem",textDecoration:isCollected?"line-through":"none"}}>{eur(monthly)}/mes</div>

              {/* Collection UI - always available */}
              {!isInactive&&(
                <div style={{marginBottom:"0.5rem"}}>
                  {isCollected&&(
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"0.35rem",padding:"0.25rem 0.5rem",background:"#00B89415",borderRadius:"7px"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#00B894",flexShrink:0}}/>
                      <span style={{fontSize:"0.63rem",color:"#00B894",fontWeight:600}}>Cobrado este mes ({monthLP[l.id]?.date})</span>
                      <button onClick={()=>uncollectLoan(l)} style={{marginLeft:"auto",background:"none",border:"none",color:t.textTertiary,fontSize:"0.62rem",cursor:"pointer",fontFamily:"inherit"}}>deshacer</button>
                    </div>
                  )}
                  <Inp type="date" value={getDate(l.id)} onChange={e=>setCollectDates(p=>({...p,[l.id]:e.target.value}))} t={t} style={{width:"100%",fontSize:"0.72rem",marginBottom:"0.3rem"}}/>
                  <button onClick={()=>collectLoan(l)} style={{width:"100%",background:isCollected?"#00B89420":t.greenBg,border:`1px solid ${isCollected?"#00B89440":t.green+"44"}`,borderRadius:"8px",padding:"0.35rem",color:isCollected?"#00B894":t.green,fontSize:"0.7rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    {isCollected?"+ Cobrar de nuevo ":"+ Cobrar "}{eur(monthly)}
                  </button>
                </div>
              )}
              {/* Payment history */}
              {loanCollectionLog.filter(e=>e.loanId===l.id).length>0&&(
                <details style={{marginBottom:"0.5rem"}}>
                  <summary style={{fontSize:"0.63rem",color:t.textTertiary,cursor:"pointer",listStyle:"none",display:"flex",alignItems:"center",gap:"0.3rem"}}>
                    <span>▸</span><span>Historial ({loanCollectionLog.filter(e=>e.loanId===l.id).length} cobros)</span>
                  </summary>
                  <div style={{marginTop:"0.35rem",display:"flex",flexDirection:"column",gap:"0.2rem",maxHeight:"120px",overflowY:"auto"}}>
                    {[...loanCollectionLog].filter(e=>e.loanId===l.id).reverse().map((e,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"0.22rem 0.4rem",background:t.surfaceHover,borderRadius:"6px",fontSize:"0.65rem"}}>
                        <span style={{color:t.textSecondary}}>{e.date}</span>
                        <span style={{color:"#00B894",fontWeight:600}}>+{eur(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
                <SmBtn onClick={()=>{setEditLoanId(l.id);setEditLoan({label:l.label,borrower:l.borrower||"",principal:l.principal,rate:l.rate});}} t={t}>✏</SmBtn>
                <SmBtn onClick={()=>setLoans(p=>p.map(x=>x.id===l.id?{...x,status:x.status==="inactive"?"active":"inactive"}:x))} t={t} color={isInactive?t.blue:t.textTertiary}>
                  {isInactive?"Reactivar":"Pausar"}
                </SmBtn>
                <SmBtn onClick={()=>{if(window.confirm("¿Eliminar?"))setLoans(p=>p.filter(x=>x.id!==l.id));}} t={t} color={t.red}>✕</SmBtn>
              </div>
            </Card>
          );
        })}

        {/* Add loan card */}
        {!addingLoan&&(
          <button onClick={()=>setAddingLoan(true)} style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:"16px",padding:"1rem",color:t.textTertiary,fontSize:"0.78rem",cursor:"pointer",minHeight:"6rem"}}>
            + Nuevo préstamo
          </button>
        )}
      </div>

      {addingLoan&&(
        <Card t={t}>
          <Lbl t={t}>Nuevo préstamo</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
            <Inp placeholder="Concepto" value={loanForm.label} onChange={e=>setLoanForm(p=>({...p,label:e.target.value}))} t={t}/>
            <Inp placeholder="Prestatario" value={loanForm.borrower} onChange={e=>setLoanForm(p=>({...p,borrower:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Capital €" value={loanForm.principal} onChange={e=>setLoanForm(p=>({...p,principal:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Tasa %/mes" value={loanForm.rate} onChange={e=>setLoanForm(p=>({...p,rate:e.target.value}))} t={t}/>
            <Inp type="date" value={loanForm.startDate} onChange={e=>setLoanForm(p=>({...p,startDate:e.target.value}))} t={t} style={{gridColumn:"span 2"}}/>
          </div>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <PrimBtn onClick={addLoan} t={t}>Añadir préstamo</PrimBtn>
            <SmBtn onClick={()=>setAddingLoan(false)} t={t}>Cancelar</SmBtn>
          </div>
        </Card>
      )}

      {/* Independence progress */}
      <Card t={t} style={{background:t.blueBg,border:`1px solid ${t.blue}33`}}>
        <Lbl t={t}>Meta: independencia financiera</Lbl>
        <div style={{fontSize:"0.78rem",color:t.textSecondary,marginBottom:"0.6rem",lineHeight:1.5}}>
          Con <strong style={{color:t.text}}>{eur(loanCapital)}</strong> al 15% generas <strong style={{color:t.green}}>{eur(loanIncome)}/mes</strong>.<br/>
          Necesitas <strong style={{color:t.text}}>{eur(8900)}</strong> prestados para cubrir todos los gastos.
        </div>
        <ProgBar value={loanCapital} max={8900} color={t.blue} t={t} height={6}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.35rem",fontSize:"0.68rem",color:t.textTertiary}}>
          <span>{((loanCapital/8900)*100).toFixed(1)}%</span>
          <span>Faltan {eur(Math.max(0,8900-loanCapital))}</span>
        </div>
      </Card>

      {/* Recomendaciones ingresos */}
      <Card t={t} style={{background:t.surfaceHover}}>
        <Lbl t={t}>Recomendaciones</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
          {uncollected.length>0&&(
            <div style={{fontSize:"0.75rem",color:t.gold}}>
              Pendiente cobrar: {uncollected.map(l=>l.label).join(", ")} — {eur(uncollected.reduce((s,l)=>s+l.principal*(l.rate/100),0))} este mes.
            </div>
          )}
          {uncollected.length===0&&activeLoans.length>0&&(
            <div style={{fontSize:"0.75rem",color:t.green}}>
              Todos los préstamos cobrados este mes. {eur(loanIncome)} ingresados.
            </div>
          )}
          {loanCapital<8900&&(
            <div style={{fontSize:"0.75rem",color:t.blue}}>
              Ampliar cartera a {eur(8900)} (+{eur(8900-loanCapital)}) cubriría todos tus gastos con intereses.
            </div>
          )}
          {capital>0&&(
            <div style={{fontSize:"0.75rem",color:t.textSecondary}}>
              Tienes {eur(capital)} de capital. Considera amortizar deudas o ampliar cartera de préstamos.
            </div>
          )}
        </div>
      </Card>

      <AccountsCard accounts={accounts} setAccounts={setAccounts} capital={capital} t={t}/>
      <FriendLoansCard friendLoans={friendLoans} setFriendLoans={setFriendLoans} t={t}/>
    </div>
  );
}

// ─── ACCOUNTS CARD ────────────────────────────────────────────────────────────
const ACC_TYPES=[{id:"banco",label:"Banco",color:"#45B7D1"},{id:"efectivo",label:"Efectivo",color:"#00B894"},{id:"ahorro",label:"Ahorro",color:"#C39BD3"},{id:"inversion",label:"Inversión",color:"#F0B27A"},{id:"otra",label:"Otra",color:"#96CEB4"}];
function AccountsCard({accounts,setAccounts,capital,t}) {
  const [adding,setAdding]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({label:"",type:"banco",amount:""});
  const total=accounts.reduce((s,a)=>s+a.amount,0);
  const diff=capital-total;

  const add=()=>{
    if(!form.label||form.amount==="") return;
    setAccounts(p=>[...p,{id:Date.now().toString(),...form,amount:+form.amount}]);
    setForm({label:"",type:"banco",amount:""});setAdding(false);
  };
  const saveEdit=(id,data)=>{
    setAccounts(p=>p.map(a=>a.id===id?{...a,...data,amount:+data.amount}:a));
    setEditing(null);
  };
  const remove=(id)=>{if(window.confirm("¿Eliminar?"))setAccounts(p=>p.filter(a=>a.id!==id));};

  return(
    <Card t={t}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
        <div>
          <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"0.2rem"}}>Mis cuentas y efectivo</div>
          <div style={{fontSize:"1.5rem",fontWeight:800,color:t.text,letterSpacing:"-0.02em"}}>{eur(total)}</div>
          {Math.abs(diff)>0.5&&<div style={{fontSize:"0.65rem",color:Math.abs(diff)<10?t.textTertiary:t.gold,marginTop:"0.1rem"}}>
            {diff>0?`${eur(diff)} sin asignar a cuentas`:`${eur(Math.abs(diff))} en cuentas > capital registrado`}
          </div>}
        </div>
        <button onClick={()=>setAdding(!adding)} style={{background:t.accentMuted,border:`1px solid ${t.border}`,borderRadius:"9px",padding:"0.38rem 0.7rem",color:t.text,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Cuenta</button>
      </div>

      {/* Accounts list */}
      <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:adding?"0.75rem":"0"}}>
        {accounts.map(a=>{
          const typeInfo=ACC_TYPES.find(x=>x.id===a.type)||ACC_TYPES[0];
          if(editing===a.id){
            return <AccountEditRow key={a.id} a={a} t={t} saveEdit={saveEdit} setEditing={setEditing}/>;
          }
          return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.45rem 0.6rem",borderRadius:"10px",background:t.surfaceHover}}>
              <div style={{width:10,height:10,borderRadius:3,background:typeInfo.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.8rem",fontWeight:500,color:t.text}}>{a.label}</div>
                <div style={{fontSize:"0.6rem",color:t.textTertiary}}>{typeInfo.label}</div>
              </div>
              <div style={{fontSize:"0.95rem",fontWeight:700,color:t.text}}>{eur(a.amount)}</div>
              <div style={{display:"flex",gap:"0.25rem"}}>
                <SmBtn onClick={()=>setEditing(a.id)} t={t}>✏</SmBtn>
                <SmBtn onClick={()=>remove(a.id)} t={t} color={t.red}>✕</SmBtn>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {adding&&(
        <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap",padding:"0.5rem",background:t.surfaceHover,borderRadius:"10px",marginTop:"0.4rem"}}>
          <Inp placeholder="Nombre (ej: BBVA, Efectivo)" value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))} t={t} style={{flex:2,minWidth:"9rem"}}/>
          <Sel value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} t={t} style={{flex:1}}>
            {ACC_TYPES.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
          </Sel>
          <Inp type="number" placeholder="€" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1,minWidth:"5rem"}}/>
          <PrimBtn onClick={add} t={t}>Añadir</PrimBtn>
          <SmBtn onClick={()=>setAdding(false)} t={t}>✕</SmBtn>
        </div>
      )}

      {/* Distribution bar */}
      {accounts.length>0&&total>0&&(
        <div style={{marginTop:"0.75rem"}}>
          <div style={{height:8,borderRadius:99,overflow:"hidden",display:"flex",gap:"1px"}}>
            {accounts.map(a=>{
              const typeInfo=ACC_TYPES.find(x=>x.id===a.type)||ACC_TYPES[0];
              return <div key={a.id} style={{width:(a.amount/total*100)+"%",background:typeInfo.color,transition:"width 0.3s"}}/>;
            })}
          </div>
          <div style={{display:"flex",gap:"0.75rem",marginTop:"0.4rem",flexWrap:"wrap"}}>
            {accounts.map(a=>{
              const typeInfo=ACC_TYPES.find(x=>x.id===a.type)||ACC_TYPES[0];
              return <div key={a.id} style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.62rem"}}>
                <div style={{width:7,height:7,borderRadius:2,background:typeInfo.color}}/>
                <span style={{color:t.textTertiary}}>{a.label}</span>
                <span style={{fontWeight:600,color:t.text}}>{((a.amount/total)*100).toFixed(0)}%</span>
              </div>;
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── FRIEND LOANS CARD ────────────────────────────────────────────────────────
function FriendLoansCard({friendLoans,setFriendLoans,t}) {
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({name:"",amount:"",date:today(),note:""});

  const pending=friendLoans.filter(l=>!l.settled);
  const totalPending=pending.reduce((s,l)=>s+l.amount,0);

  const add=()=>{
    if(!form.name||!form.amount) return;
    setFriendLoans(p=>[...p,{id:Date.now().toString(),...form,amount:+form.amount,settled:false}]);
    setForm({name:"",amount:"",date:today(),note:""});setAdding(false);
  };
  const settle=(id)=>setFriendLoans(p=>p.map(x=>x.id===id?{...x,settled:true,settledDate:today()}:x));
  const remove=(id)=>{if(window.confirm("¿Eliminar?"))setFriendLoans(p=>p.filter(x=>x.id!==id));};

  return(
    <Card t={t}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
        <div>
          <Lbl t={t}>Me deben (amigos)</Lbl>
          {totalPending>0&&<div style={{fontSize:"1.4rem",fontWeight:800,color:"#F0B27A",letterSpacing:"-0.02em"}}>{eur(totalPending)}</div>}
          {totalPending===0&&pending.length===0&&<div style={{fontSize:"0.75rem",color:t.textTertiary}}>Nadie te debe dinero</div>}
        </div>
        <button onClick={()=>setAdding(!adding)} style={{background:"#F0B27A22",border:`1px solid #F0B27A44`,borderRadius:"9px",padding:"0.38rem 0.7rem",color:"#F0B27A",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Añadir</button>
      </div>

      {adding&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.35rem",marginBottom:"0.75rem",padding:"0.75rem",background:t.surfaceHover,borderRadius:"12px"}}>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <Inp placeholder="Nombre" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} t={t} style={{flex:2}}/>
            <Inp type="number" placeholder="€" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1}}/>
          </div>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <Inp type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} t={t} style={{flex:1}}/>
            <Inp placeholder="Nota (opcional)" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} t={t} style={{flex:2}}/>
          </div>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <PrimBtn onClick={add} t={t}>Guardar</PrimBtn>
            <SmBtn onClick={()=>setAdding(false)} t={t}>Cancelar</SmBtn>
          </div>
        </div>
      )}

      {/* Pending loans */}
      {pending.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",marginBottom:"0.5rem"}}>
          {pending.map(l=>(
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0.6rem",background:`#F0B27A14`,border:`1px solid #F0B27A30`,borderRadius:"10px"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:"0.4rem",alignItems:"baseline"}}>
                  <span style={{fontSize:"0.85rem",fontWeight:700,color:t.text}}>{l.name}</span>
                  <span style={{fontSize:"0.62rem",color:t.textTertiary}}>{l.date}</span>
                </div>
                {l.note&&<div style={{fontSize:"0.65rem",color:t.textTertiary,marginTop:"0.1rem"}}>{l.note}</div>}
              </div>
              <span style={{fontSize:"1rem",fontWeight:800,color:"#F0B27A",flexShrink:0}}>{eur(l.amount)}</span>
              <button onClick={()=>settle(l.id)} style={{background:"#00B89422",border:`1px solid #00B89444`,borderRadius:"8px",padding:"0.28rem 0.5rem",color:"#00B894",fontSize:"0.65rem",fontWeight:700,cursor:"pointer",flexShrink:0,fontFamily:"inherit"}}>✓ Cobrado</button>
              <SmBtn onClick={()=>remove(l.id)} t={t} color={t.red}>✕</SmBtn>
            </div>
          ))}
        </div>
      )}

      {/* Settled loans (collapsed) */}
      {friendLoans.filter(l=>l.settled).length>0&&(
        <details style={{fontSize:"0.7rem",color:t.textTertiary}}>
          <summary style={{cursor:"pointer",marginTop:"0.3rem"}}>Ver cobrados ({friendLoans.filter(l=>l.settled).length})</summary>
          <div style={{marginTop:"0.4rem",display:"flex",flexDirection:"column",gap:"0.3rem"}}>
            {friendLoans.filter(l=>l.settled).map(l=>(
              <div key={l.id} style={{display:"flex",justifyContent:"space-between",opacity:0.5,padding:"0.3rem 0.4rem"}}>
                <span style={{textDecoration:"line-through"}}>{l.name} · {l.date}</span>
                <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
                  <span>{eur(l.amount)}</span>
                  <SmBtn onClick={()=>remove(l.id)} t={t} color={t.red}>✕</SmBtn>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </Card>
  );
}

// ─── GASTOS TAB ───────────────────────────────────────────────────────────────
function GastosTab({expenses,setExpenses,payments,setPayments,unexpectedExp,setUnexpectedExp,funLimit,setFunLimit,capital,setCapital,t}) {
  const [adding,       setAdding]     = useState(false);
  const [form,         setForm]       = useState({label:"",amount:"",cat:"fijo"});
  const [editId,       setEditId]     = useState(null);
  const [editData,     setEditData]   = useState({});
  const [unexpForm,    setUnexpForm]  = useState({label:"",amount:""});
  const [addingUnexp,  setAddingUnexp]= useState(false);
  const [editingLimit, setEditingLimit]=useState(false);
  const [limitInput,   setLimitInput] = useState(funLimit);

  const thisMonth = mk();
  const paid      = payments[thisMonth]||{};
  const monthUnexp= unexpectedExp[thisMonth]||[];
  const totalExp  = expenses.reduce((s,e)=>s+e.amount,0);
  const paidTotal = expenses.filter(e=>paid[e.id]).reduce((s,e)=>s+e.amount,0);
  const unexpTotal= monthUnexp.reduce((s,u)=>s+u.amount,0);

  // Fun spending = ocio + personal from regular expenses (paid ones)
  const funPaid   = expenses.filter(e=>paid[e.id]&&(e.cat==="ocio"||e.cat==="personal")).reduce((s,e)=>s+e.amount,0);
  // eslint-disable-next-line no-unused-vars
  const funTotal  = expenses.filter(e=>e.cat==="ocio"||e.cat==="personal").reduce((s,e)=>s+e.amount,0);
  const funOver   = (funPaid+unexpTotal) > funLimit;

  // Weekly summary
  const now       = new Date();
  const dayOfMonth= now.getDate();
  const daysInMo  = new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const weekNum   = Math.ceil(dayOfMonth/7);
  const weekDay1  = (weekNum-1)*7+1;
  const weekDay2  = Math.min(weekNum*7, daysInMo);
  const monthPct  = dayOfMonth/daysInMo;
  const idealSpent= totalExp*monthPct;
  const pace      = paidTotal-idealSpent;

  const markPaid=(e)=>{
    if(paid[e.id]) return;
    setPayments(p=>({...p,[thisMonth]:{...(p[thisMonth]||{}),[e.id]:true}}));
    setCapital(v=>v-e.amount);
  };
  const unmark=(e)=>{
    setPayments(p=>{const m={...(p[thisMonth]||{})};delete m[e.id];return{...p,[thisMonth]:m};});
    setCapital(v=>v+e.amount);
  };
  const add=()=>{
    if(!form.label||!form.amount) return;
    setExpenses(p=>[...p,{id:Date.now().toString(),label:form.label,amount:+form.amount,cat:form.cat}]);
    setForm({label:"",amount:"",cat:"fijo"});setAdding(false);
  };
  const saveEdit=(id)=>{
    setExpenses(p=>p.map(e=>e.id===id?{...e,...editData,amount:+editData.amount}:e));
    setEditId(null);
  };
  const addUnexp=()=>{
    if(!unexpForm.label||!unexpForm.amount) return;
    const entry={id:Date.now().toString(),label:unexpForm.label,amount:+unexpForm.amount,date:today()};
    setUnexpectedExp(p=>({...p,[thisMonth]:[...(p[thisMonth]||[]),entry]}));
    setCapital(v=>v-entry.amount);
    setUnexpForm({label:"",amount:""});setAddingUnexp(false);
  };
  const deleteUnexp=(id)=>{
    const entry=monthUnexp.find(u=>u.id===id);
    if(!entry) return;
    setUnexpectedExp(p=>({...p,[thisMonth]:(p[thisMonth]||[]).filter(u=>u.id!==id)}));
    setCapital(v=>v+entry.amount);
  };

  const cats=["vivienda","alimentación","salud","deuda","fijo","transporte","personal","ocio"];

  const QUICK_PRESETS=[
    {label:"Uber",        amount:12, cat:"transporte"},
    {label:"Glovo",       amount:18, cat:"ocio"},
    {label:"Weed",        amount:30, cat:"personal"},
    {label:"Comida fuera",amount:20, cat:"alimentación"},
    {label:"Farmacia",    amount:15, cat:"salud"},
    {label:"Taxi",        amount:10, cat:"transporte"},
    {label:"Cervezas",    amount:15, cat:"ocio"},
    {label:"Capricho",    amount:25, cat:"personal"},
  ];

  const addPreset=(preset)=>{
    const entry={id:Date.now().toString(),label:preset.label,amount:preset.amount,date:today()};
    setUnexpectedExp(p=>({...p,[thisMonth]:[...(p[thisMonth]||[]),entry]}));
    setCapital(v=>v-entry.amount);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
      {/* Summary */}
      <Card t={t}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.7rem"}}>
          <div>
            <Lbl t={t}>Capital disponible</Lbl>
            <div style={{fontSize:"1.7rem",fontWeight:800,color:capital>=0?t.text:t.red,letterSpacing:"-0.02em"}}>{eur(capital)}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <Lbl t={t}>Pendiente de pagar</Lbl>
            <div style={{fontSize:"1.1rem",fontWeight:700,color:t.gold}}>{eur(totalExp-paidTotal)}</div>
          </div>
        </div>
        <ProgBar value={paidTotal} max={totalExp} color={t.green} t={t} height={6}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.4rem",fontSize:"0.7rem",color:t.textTertiary}}>
          <span>Pagado: <strong style={{color:t.green}}>{eur(paidTotal)}</strong></span>
          <span>{expenses.filter(e=>paid[e.id]).length}/{expenses.length} gastos</span>
        </div>
      </Card>

      {/* Weekly summary */}
      <Card t={t} style={{background:t.surfaceHover}}>
        <Lbl t={t}>Resumen semanal — Semana {weekNum} (días {weekDay1}-{weekDay2})</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"0.4rem"}}>
          <div>
            <div style={{fontSize:"0.62rem",color:t.textTertiary}}>Día del mes</div>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:t.text}}>{dayOfMonth}/{daysInMo}</div>
          </div>
          <div>
            <div style={{fontSize:"0.62rem",color:t.textTertiary}}>Ritmo vs ideal</div>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:Math.abs(pace)<30?t.green:pace>0?t.gold:t.blue}}>
              {pace>0?"+"+(eur(pace)):" -"+(eur(Math.abs(pace)))}
            </div>
          </div>
          <div>
            <div style={{fontSize:"0.62rem",color:t.textTertiary}}>% mes</div>
            <div style={{fontSize:"0.85rem",fontWeight:700,color:t.text}}>{(monthPct*100).toFixed(0)}%</div>
          </div>
        </div>
        <div style={{fontSize:"0.68rem",color:pace>30?t.gold:t.textTertiary}}>
          {pace>30?"Vas por delante del ritmo ideal este mes.":pace<-30?"Llevas menos pagado de lo esperado.":"Ritmo de pago correcto."}
        </div>
      </Card>

      {/* Gasto discrecional */}
      <Card t={t} style={{border:`1px solid ${funOver?"#FF6B6B44":t.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem"}}>
          <div>
            <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"0.25rem"}}>Gasto discrecional · {new Date().toLocaleDateString("es-ES",{month:"long"})}</div>
            <div style={{fontSize:"0.62rem",color:t.textTertiary}}>ocio + personal + inesperados · reinicia el 1 de cada mes</div>
          </div>
          {editingLimit?(
            <div style={{display:"flex",gap:"0.25rem",alignItems:"center"}}>
              <Inp type="number" value={limitInput} onChange={e=>setLimitInput(e.target.value)} t={t} style={{width:"5rem",fontSize:"0.75rem"}}/>
              <SmBtn onClick={()=>{setFunLimit(+limitInput);setEditingLimit(false);}} t={t} color={t.green}>✓</SmBtn>
              <SmBtn onClick={()=>setEditingLimit(false)} t={t}>✕</SmBtn>
            </div>
          ):(
            <SmBtn onClick={()=>{setLimitInput(funLimit);setEditingLimit(true);}} t={t}>Límite: {eur(funLimit)}</SmBtn>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.5rem"}}>
          <div style={{fontSize:"1.6rem",fontWeight:800,letterSpacing:"-0.02em",color:funOver?"#FF6B6B":"#F7DC6F"}}>{eur(funPaid+unexpTotal)}</div>
          <div style={{fontSize:"0.72rem",color:t.textTertiary}}>de {eur(funLimit)}</div>
        </div>
        <div style={{background:t.border,borderRadius:99,height:8,overflow:"hidden",marginBottom:"0.5rem"}}>
          <div style={{width:Math.min(100,((funPaid+unexpTotal)/funLimit)*100)+"%",background:funOver?"#FF6B6B":"#F7DC6F",height:"100%",borderRadius:99,transition:"width 0.4s"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem",fontSize:"0.65rem"}}>
          <div style={{background:t.surfaceHover,borderRadius:"8px",padding:"0.35rem 0.5rem"}}>
            <div style={{color:t.textTertiary,marginBottom:"0.15rem"}}>Ocio/personal</div>
            <div style={{fontWeight:700,color:t.text}}>{eur(funPaid)}</div>
          </div>
          <div style={{background:t.surfaceHover,borderRadius:"8px",padding:"0.35rem 0.5rem"}}>
            <div style={{color:t.textTertiary,marginBottom:"0.15rem"}}>Inesperados</div>
            <div style={{fontWeight:700,color:unexpTotal>0?"#FF6B6B":t.text}}>{eur(unexpTotal)}</div>
          </div>
          <div style={{background:funOver?"#FF6B6B18":"#F7DC6F18",borderRadius:"8px",padding:"0.35rem 0.5rem",border:`1px solid ${funOver?"#FF6B6B33":"#F7DC6F33"}`}}>
            <div style={{color:t.textTertiary,marginBottom:"0.15rem"}}>{funOver?"Exceso":"Disponible"}</div>
            <div style={{fontWeight:700,color:funOver?"#FF6B6B":"#F7DC6F"}}>{eur(Math.abs(funLimit-funPaid-unexpTotal))}</div>
          </div>
        </div>
        {funOver&&<div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#FF6B6B",fontWeight:600,background:"#FF6B6B12",padding:"0.4rem 0.6rem",borderRadius:"8px"}}>Límite superado en {eur(funPaid+unexpTotal-funLimit)} este mes</div>}
      </Card>

      {/* Unexpected expenses */}
      <Card t={t}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
          <Lbl t={t}>Gastos inesperados — {mk()}</Lbl>
          {unexpTotal>0&&<span style={{fontSize:"0.75rem",fontWeight:700,color:t.red}}>{eur(unexpTotal)}</span>}
        </div>
        {/* Quick preset chips */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.75rem"}}>
          {QUICK_PRESETS.map(p=>(
            <button key={p.label} onClick={()=>addPreset(p)}
              style={{background:t.surfaceHover,border:`1px solid ${t.border}`,borderRadius:"20px",padding:"0.28rem 0.65rem",color:t.textSecondary,fontSize:"0.7rem",cursor:"pointer",fontFamily:"inherit",display:"flex",gap:"0.3rem",alignItems:"center"}}>
              <span>{p.label}</span>
              <span style={{color:t.textTertiary,fontSize:"0.65rem"}}>{eur(p.amount)}</span>
            </button>
          ))}
        </div>
        {monthUnexp.length===0&&!addingUnexp&&(
          <div style={{fontSize:"0.72rem",color:t.textTertiary,marginBottom:"0.5rem"}}>Sin gastos inesperados este mes.</div>
        )}
        {monthUnexp.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",paddingBottom:"0.6rem",marginBottom:"0.6rem",borderBottom:`1px solid ${t.border}`}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"0.82rem",color:t.text}}>{u.label}</div>
              <div style={{fontSize:"0.62rem",color:t.textTertiary}}>{u.date}</div>
            </div>
            <span style={{fontSize:"0.9rem",fontWeight:600,color:t.red}}>{eur(u.amount)}</span>
            <SmBtn onClick={()=>deleteUnexp(u.id)} t={t} color={t.red}>✕</SmBtn>
          </div>
        ))}
        {addingUnexp?(
          <div style={{display:"flex",gap:"0.35rem",marginTop:"0.3rem"}}>
            <Inp placeholder="¿Qué fue?" value={unexpForm.label} onChange={e=>setUnexpForm(p=>({...p,label:e.target.value}))} t={t} style={{flex:2}}/>
            <Inp placeholder="€" type="number" value={unexpForm.amount} onChange={e=>setUnexpForm(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1}}/>
            <PrimBtn onClick={addUnexp} t={t}>+</PrimBtn>
            <SmBtn onClick={()=>setAddingUnexp(false)} t={t}>✕</SmBtn>
          </div>
        ):(
          <button onClick={()=>setAddingUnexp(true)} style={{background:t.redBg,border:`1px solid ${t.red}44`,borderRadius:"9px",padding:"0.45rem 0.8rem",color:t.red,fontSize:"0.73rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
            + Añadir gasto inesperado
          </button>
        )}
      </Card>

      {/* Expense list */}
      <Card t={t}>
        <Lbl t={t}>Gastos del mes — confirma al pagar</Lbl>
        {expenses.map(e=>{
          const isPaid=!!paid[e.id];
          if(editId===e.id) return(
            <div key={e.id} style={{paddingBottom:"0.75rem",marginBottom:"0.75rem",borderBottom:`1px solid ${t.border}`}}>
              <div style={{display:"flex",gap:"0.35rem",marginBottom:"0.35rem"}}>
                <Inp value={editData.label} onChange={v=>setEditData(p=>({...p,label:v.target.value}))} t={t} style={{flex:2}}/>
                <Inp type="number" value={editData.amount} onChange={v=>setEditData(p=>({...p,amount:v.target.value}))} t={t} style={{flex:1}}/>
              </div>
              <div style={{display:"flex",gap:"0.35rem"}}>
                <PrimBtn onClick={()=>saveEdit(e.id)} t={t}>Guardar</PrimBtn>
                <SmBtn onClick={()=>setEditId(null)} t={t}>Cancelar</SmBtn>
              </div>
            </div>
          );
          return(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.5rem",paddingBottom:"0.75rem",marginBottom:"0.75rem",borderBottom:`1px solid ${t.border}`,opacity:isPaid?0.5:1}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.85rem",color:t.text,textDecoration:isPaid?"line-through":"none"}}>{e.label}</div>
                <div style={{fontSize:"0.62rem",color:t.textTertiary}}>{e.cat}</div>
              </div>
              <span style={{fontSize:"0.9rem",fontWeight:600,color:t.text,flexShrink:0}}>{eur(e.amount)}</span>
              {isPaid
                ?<button onClick={()=>unmark(e)} style={{background:t.greenBg,border:`1px solid ${t.green}44`,borderRadius:"8px",padding:"0.3rem 0.6rem",color:t.green,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>✓ Pagado</button>
                :<button onClick={()=>markPaid(e)} style={{background:t.accent,border:"none",borderRadius:"8px",padding:"0.3rem 0.6rem",color:t.bg,fontSize:"0.68rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>Pagar</button>
              }
              <SmBtn onClick={()=>{setEditId(e.id);setEditData({label:e.label,amount:e.amount,cat:e.cat});}} t={t}>✏</SmBtn>
              <SmBtn onClick={()=>{if(window.confirm("¿Eliminar?"))setExpenses(p=>p.filter(x=>x.id!==e.id));}} t={t} color={t.red}>✕</SmBtn>
            </div>
          );
        })}

        {adding?(
          <div style={{display:"flex",flexDirection:"column",gap:"0.35rem",marginTop:"0.3rem"}}>
            <div style={{display:"flex",gap:"0.35rem"}}>
              <Inp placeholder="Concepto" value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))} t={t} style={{flex:2}}/>
              <Inp placeholder="€" type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} t={t} style={{flex:1}}/>
            </div>
            <div style={{display:"flex",gap:"0.35rem"}}>
              <Sel value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))} t={t} style={{flex:1}}>
                {cats.map(c=><option key={c} value={c}>{c}</option>)}
              </Sel>
              <PrimBtn onClick={add} t={t}>Añadir</PrimBtn>
              <SmBtn onClick={()=>setAdding(false)} t={t}>✕</SmBtn>
            </div>
          </div>
        ):(
          <SmBtn onClick={()=>setAdding(true)} t={t}>+ Nuevo gasto fijo</SmBtn>
        )}
      </Card>

      <SmBtn onClick={()=>{if(window.confirm("¿Reiniciar pagos del mes?"))setPayments(p=>({...p,[thisMonth]:{}}));}} t={t}>
        Reiniciar confirmaciones del mes
      </SmBtn>
    </div>
  );
}

// ─── DEUDAS TAB ───────────────────────────────────────────────────────────────
function DebtCard({d,setDebts,capital,t}) {
  const [extra,    setExtra]    = useState(0);
  const [editing,  setEditing]  = useState(false);
  const [editData, setEditData] = useState({});

  const basePayment = d.monthlyPayment;
  const total       = d.type==="amortizing"?calcPayoff(d.total,d.rate,basePayment):null;
  const withExtra   = extra>0&&d.type==="amortizing"?calcPayoff(d.total,d.rate,basePayment+extra):null;
  const interestSaving = total&&withExtra?total.interest-withExtra.interest:0;

  if(editing) return(
    <Card t={t}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
        <Inp placeholder="Nombre" value={editData.label} onChange={e=>setEditData(p=>({...p,label:e.target.value}))} t={t} style={{gridColumn:"span 2"}}/>
        <Inp type="number" placeholder="Capital €" value={editData.total} onChange={e=>setEditData(p=>({...p,total:e.target.value}))} t={t}/>
        <Inp type="number" placeholder="Tasa %/mes" value={editData.rate} onChange={e=>setEditData(p=>({...p,rate:e.target.value}))} t={t}/>
        <Inp type="number" placeholder="Cuota €/mes" value={editData.monthlyPayment} onChange={e=>setEditData(p=>({...p,monthlyPayment:e.target.value}))} t={t}/>
        <Sel value={editData.type} onChange={e=>setEditData(p=>({...p,type:e.target.value}))} t={t}>
          <option value="amortizing">Amortizando capital</option>
          <option value="interest-only">Solo intereses</option>
        </Sel>
      </div>
      <div style={{display:"flex",gap:"0.35rem"}}>
        <PrimBtn onClick={()=>{setDebts(p=>p.map(x=>x.id===d.id?{...x,...editData,total:+editData.total,rate:+editData.rate,monthlyPayment:+editData.monthlyPayment}:x));setEditing(false);}} t={t}>Guardar</PrimBtn>
        <SmBtn onClick={()=>setEditing(false)} t={t}>Cancelar</SmBtn>
      </div>
    </Card>
  );

  return(
    <Card t={t}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.75rem"}}>
        <div>
          <div style={{fontSize:"1rem",fontWeight:600,color:t.text}}>{d.label}</div>
          <div style={{fontSize:"0.65rem",color:t.textTertiary,marginTop:"0.1rem"}}>{d.rate}%/mes · {d.type==="interest-only"?"solo intereses":"amortizando"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"1.5rem",fontWeight:800,color:t.red}}>{eur(d.total)}</div>
          <div style={{fontSize:"0.68rem",color:t.textTertiary}}>{eur(basePayment)}/mes mínimo</div>
        </div>
      </div>

      {/* Amortization info */}
      {d.type==="amortizing"&&total&&(
        <div style={{background:t.surfaceHover,borderRadius:"10px",padding:"0.65rem",marginBottom:"0.75rem"}}>
          <div style={{fontSize:"0.65rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"0.4rem"}}>Con cuota actual</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"}}>
            {[
              {l:"Plazo",    v:`${total.months} meses`},
              {l:"Liquidado",v:new Date(Date.now()+total.months*30.44*24*3600000).toLocaleDateString("es-ES",{month:"short",year:"numeric"})},
              {l:"Total pagado",  v:eur(total.totalPaid), color:t.text},
              {l:"Intereses",    v:eur(total.interest),   color:t.red},
            ].map(({l,v,color})=>(
              <div key={l}>
                <div style={{fontSize:"0.6rem",color:t.textTertiary}}>{l}</div>
                <div style={{fontSize:"0.78rem",fontWeight:600,color:color||t.text}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {d.type==="interest-only"&&(
        <div style={{background:t.goldBg,borderRadius:"10px",padding:"0.65rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:t.gold}}>
          Capital no amortiza. Pagas {eur(d.total*d.rate/100)}/mes indefinidamente. Considera amortizar capital.
        </div>
      )}

      {/* Extra payment calculator */}
      {d.type==="amortizing"&&(
        <div style={{marginBottom:"0.75rem"}}>
          <div style={{fontSize:"0.65rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"0.4rem"}}>Calculadora: pago extra mensual</div>
          <div style={{display:"flex",gap:"0.35rem",alignItems:"center",marginBottom:"0.4rem"}}>
            <Inp type="number" placeholder="€ extra/mes" value={extra||""} onChange={e=>setExtra(+e.target.value||0)} t={t} style={{flex:1}}/>
            {[50,100,200].map(amt=>(
              <button key={amt} onClick={()=>setExtra(e=>e===amt?0:amt)} style={{background:extra===amt?t.accent:t.accentMuted,border:`1px solid ${t.border}`,borderRadius:"8px",padding:"0.4rem 0.5rem",color:extra===amt?t.bg:t.textSecondary,fontSize:"0.7rem",cursor:"pointer"}}>
                +{amt}
              </button>
            ))}
          </div>
          {extra>0&&withExtra&&(
            <div style={{background:t.greenBg,border:`1px solid ${t.green}33`,borderRadius:"10px",padding:"0.65rem",fontSize:"0.75rem",marginBottom:"0.4rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem",marginBottom:"0.4rem"}}>
                <div>
                  <div style={{color:t.textTertiary,fontSize:"0.62rem"}}>Nuevo plazo</div>
                  <div style={{fontWeight:700,color:t.green}}>{withExtra.months} meses</div>
                  <div style={{fontSize:"0.62rem",color:t.textTertiary}}>antes {total?.months} meses</div>
                </div>
                <div>
                  <div style={{color:t.textTertiary,fontSize:"0.62rem"}}>Ahorras en intereses</div>
                  <div style={{fontWeight:700,color:t.green}}>{eur(interestSaving)}</div>
                </div>
                <div>
                  <div style={{color:t.textTertiary,fontSize:"0.62rem"}}>Nueva cuota total</div>
                  <div style={{fontWeight:700,color:t.text}}>{eur(basePayment+extra)}/mes</div>
                </div>
                <div>
                  <div style={{color:t.textTertiary,fontSize:"0.62rem"}}>Nueva fecha fin</div>
                  <div style={{fontWeight:700,color:t.text}}>{new Date(Date.now()+withExtra.months*30.44*24*3600000).toLocaleDateString("es-ES",{month:"short",year:"numeric"})}</div>
                </div>
              </div>
              <button onClick={()=>{setDebts(p=>p.map(x=>x.id===d.id?{...x,monthlyPayment:basePayment+extra}:x));setExtra(0);}}
                style={{width:"100%",background:t.green,border:"none",borderRadius:"8px",padding:"0.45rem",color:"#fff",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Guardar nueva cuota {eur(basePayment+extra)}/mes
              </button>
            </div>
          )}
          {extra>0&&!withExtra&&(
            <div style={{fontSize:"0.72rem",color:t.textTertiary,padding:"0.4rem"}}>Cuota insuficiente para amortizar.</div>
          )}
          {capital>0&&extra===0&&(
            <div style={{fontSize:"0.68rem",color:t.blue,marginTop:"0.3rem"}}>
              Tienes {eur(capital)} disponible. Con {eur(Math.min(capital,200))} extra/mes ahorrarías {eur(calcPayoff(d.total,d.rate,basePayment)?.interest - (calcPayoff(d.total,d.rate,basePayment+Math.min(capital,200))?.interest||0))} en intereses.
            </div>
          )}
        </div>
      )}

      <div style={{display:"flex",gap:"0.35rem"}}>
        <SmBtn onClick={()=>{setEditing(true);setEditData({label:d.label,total:d.total,rate:d.rate,monthlyPayment:d.monthlyPayment,type:d.type});}} t={t}>Editar</SmBtn>
        <SmBtn onClick={()=>{if(window.confirm("¿Eliminar?"))setDebts(p=>p.filter(x=>x.id!==d.id));}} t={t} color={t.red}>Eliminar</SmBtn>
      </div>
    </Card>
  );
}

function DeudasTab({debts,setDebts,capital,t}) {
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({label:"",total:"",rate:"",type:"amortizing",monthlyPayment:""});
  const totalDebt    = debts.reduce((s,d)=>s+d.total,0);
  const totalMonthly = debts.reduce((s,d)=>s+d.monthlyPayment,0);
  const add=()=>{
    if(!form.label||!form.total) return;
    setDebts(p=>[...p,{id:Date.now().toString(),...form,total:+form.total,rate:+form.rate||0,monthlyPayment:+form.monthlyPayment||0}]);
    setForm({label:"",total:"",rate:"",type:"amortizing",monthlyPayment:""});setAdding(false);
  };

  // Amortization recommendations based on capital
  const amortiRecs = capital>0 ? debts.filter(d=>d.type==="amortizing").map(d=>{
    const base = calcPayoff(d.total,d.rate,d.monthlyPayment);
    const extra = Math.min(capital, d.total);
    const withAm = calcPayoff(Math.max(0,d.total-extra),d.rate,d.monthlyPayment);
    const saving = base&&withAm ? base.interest - withAm.interest : 0;
    const monthsSaved = base&&withAm ? base.months - withAm.months : 0;
    return {label:d.label, extra, saving, monthsSaved, total:d.total};
  }).filter(r=>r.saving>0) : [];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
      <div>
        <Lbl t={t}>Deuda total</Lbl>
        <div style={{fontSize:"2.4rem",fontWeight:800,color:t.red,letterSpacing:"-0.03em",lineHeight:1}}>{eur(totalDebt)}</div>
        <div style={{color:t.textTertiary,fontSize:"0.7rem",marginTop:"0.2rem"}}>{eur(totalMonthly)}/mes en cuotas · {debts.length} deudas</div>
      </div>

      {/* Amortization recommendation */}
      {capital>0&&amortiRecs.length>0&&(
        <Card t={t} style={{background:t.greenBg,border:`1px solid ${t.green}33`}}>
          <Lbl t={t}>Con {eur(capital)} de capital disponible</Lbl>
          {amortiRecs.map(r=>(
            <div key={r.label} style={{fontSize:"0.75rem",color:t.textSecondary,marginBottom:"0.4rem"}}>
              <strong style={{color:t.text}}>{r.label}:</strong> amortiza {eur(r.extra)} → ahorras <strong style={{color:t.green}}>{eur(r.saving)}</strong> en intereses, -{r.monthsSaved} meses.
            </div>
          ))}
        </Card>
      )}

      {debts.map(d=><DebtCard key={d.id} d={d} setDebts={setDebts} capital={capital} t={t}/>)}

      {adding?(
        <Card t={t}>
          <Lbl t={t}>Nueva deuda</Lbl>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
            <Inp placeholder="Nombre" value={form.label} onChange={e=>setForm(p=>({...p,label:e.target.value}))} t={t} style={{gridColumn:"span 2"}}/>
            <Inp type="number" placeholder="Capital €" value={form.total} onChange={e=>setForm(p=>({...p,total:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Tasa %/mes" value={form.rate} onChange={e=>setForm(p=>({...p,rate:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Cuota €/mes" value={form.monthlyPayment} onChange={e=>setForm(p=>({...p,monthlyPayment:e.target.value}))} t={t}/>
            <Sel value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} t={t}>
              <option value="amortizing">Amortizando capital</option>
              <option value="interest-only">Solo intereses</option>
            </Sel>
          </div>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <PrimBtn onClick={add} t={t}>Añadir deuda</PrimBtn>
            <SmBtn onClick={()=>setAdding(false)} t={t}>Cancelar</SmBtn>
          </div>
        </Card>
      ):(
        <SmBtn onClick={()=>setAdding(true)} t={t}>+ Nueva deuda</SmBtn>
      )}
    </div>
  );
}

// ─── PLAN TAB ─────────────────────────────────────────────────────────────────
function GoalCard({g, setGoals, surplus, t}) {
  const [editing, setEditing] = useState(false);
  const [editData,setEditData]= useState({});
  const [contribInput,setContribInput]=useState(g.monthlyContrib||0);

  const pct        = Math.min(100,(g.saved/g.target)*100);
  const remaining  = Math.max(0,g.target-g.saved);
  const liveContrib= +contribInput||0;
  const moLeft     = liveContrib>0?Math.ceil(remaining/liveContrib):null;
  const eta        = moLeft?new Date(Date.now()+moLeft*30.44*24*3600000).toLocaleDateString("es-ES",{month:"short",year:"numeric"}):null;
  const recMonthly = g.deadline?Math.ceil(remaining/Math.max(1,Math.ceil((new Date(g.deadline)-Date.now())/(30.44*24*3600000)))):null;
  const pm         = PRIORITY_META[g.priority]||PRIORITY_META.media;

  const saveContrib=()=>{
    setGoals(p=>p.map(x=>x.id===g.id?{...x,monthlyContrib:+contribInput}:x));
  };

  if(editing) return(
    <Card t={t} style={{gridColumn:"span 2"}}>
      <Lbl t={t}>Editar objetivo</Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
        <Inp placeholder="Nombre" value={editData.label} onChange={e=>setEditData(p=>({...p,label:e.target.value}))} t={t} style={{gridColumn:"span 2"}}/>
        <Inp type="number" placeholder="Meta €" value={editData.target} onChange={e=>setEditData(p=>({...p,target:e.target.value}))} t={t}/>
        <Inp type="number" placeholder="Ahorrado €" value={editData.saved} onChange={e=>setEditData(p=>({...p,saved:e.target.value}))} t={t}/>
        <Inp type="date" value={editData.deadline||""} onChange={e=>setEditData(p=>({...p,deadline:e.target.value}))} t={t}/>
        <Sel value={editData.priority} onChange={e=>setEditData(p=>({...p,priority:e.target.value}))} t={t}>
          <option value="alta">Alta prioridad</option>
          <option value="media">Media prioridad</option>
          <option value="baja">Baja prioridad</option>
        </Sel>
      </div>
      <div style={{display:"flex",gap:"0.35rem"}}>
        <PrimBtn onClick={()=>{setGoals(p=>p.map(x=>x.id===g.id?{...x,...editData,target:+editData.target,saved:+editData.saved}:x));setEditing(false);}} t={t}>Guardar</PrimBtn>
        <SmBtn onClick={()=>setEditing(false)} t={t}>Cancelar</SmBtn>
      </div>
    </Card>
  );

  return(
    <Card t={t} style={{borderTop:`3px solid ${pm.color}`}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.4rem"}}>
        <div style={{fontSize:"0.82rem",fontWeight:600,color:t.text,lineHeight:1.3,flex:1,marginRight:"0.3rem"}}>{g.label}</div>
        <div style={{display:"flex",gap:"0.3rem",alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:"0.55rem",fontWeight:700,padding:"0.15rem 0.4rem",borderRadius:99,background:pm.bg,color:pm.color}}>{pm.label}</span>
          <span style={{fontSize:"0.65rem",color:pct>=100?t.green:t.textTertiary,fontWeight:600}}>{pct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Progress */}
      <ProgBar value={g.saved} max={g.target} color={pct>=100?t.green:pm.color} t={t} height={5}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.3rem",marginBottom:"0.6rem",fontSize:"0.68rem",color:t.textTertiary}}>
        <span>{eur(g.saved)}</span>
        <span>{eur(g.target)}</span>
      </div>

      {/* Monthly contribution editable */}
      <div style={{marginBottom:"0.5rem"}}>
        <div style={{fontSize:"0.6rem",color:t.textTertiary,marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>Aportación/mes</div>
        <div style={{display:"flex",gap:"0.3rem",alignItems:"center"}}>
          <Inp type="number" value={contribInput} onChange={e=>setContribInput(e.target.value)}
            onBlur={saveContrib} t={t} style={{flex:1,fontSize:"0.85rem",fontWeight:600}}/>
          <span style={{fontSize:"0.72rem",color:t.textTertiary}}>€</span>
        </div>
        {/* Live ETA preview */}
        {liveContrib>0&&remaining>0&&eta&&(
          <div style={{marginTop:"0.3rem",padding:"0.3rem 0.5rem",background:pm.bg,borderRadius:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"0.65rem",color:pm.color,fontWeight:700}}>{moLeft} meses → {eta}</span>
            <span style={{fontSize:"0.6rem",color:t.textTertiary}}>faltan {eur(remaining)}</span>
          </div>
        )}
        {recMonthly&&recMonthly!==liveContrib&&(
          <div style={{fontSize:"0.62rem",color:t.blue,marginTop:"0.2rem"}}>
            Para cumplir deadline: {eur(recMonthly)}/mes
            <button onClick={()=>{setContribInput(recMonthly);setGoals(p=>p.map(x=>x.id===g.id?{...x,monthlyContrib:recMonthly}:x));}}
              style={{background:"none",border:"none",color:t.blue,fontSize:"0.62rem",cursor:"pointer",padding:"0 0 0 0.3rem",fontFamily:"inherit"}}>Aplicar</button>
          </div>
        )}
      </div>

      {pct>=100&&<div style={{fontSize:"0.72rem",color:t.green,marginBottom:"0.5rem",fontWeight:700}}>Objetivo completado ✓</div>}

      {/* Quick add */}
      <div style={{display:"flex",gap:"0.25rem",marginBottom:"0.5rem"}}>
        {[50,100,200,500].map(amt=>(
          <button key={amt} onClick={()=>setGoals(p=>p.map(x=>x.id===g.id?{...x,saved:Math.min(x.saved+amt,x.target)}:x))}
            style={{flex:1,background:t.accentMuted,border:`1px solid ${t.border}`,borderRadius:"7px",padding:"0.28rem 0",color:t.textSecondary,fontSize:"0.62rem",cursor:"pointer"}}>
            +{amt}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:"0.3rem"}}>
        <SmBtn onClick={()=>{setEditing(true);setEditData({label:g.label,target:g.target,saved:g.saved,priority:g.priority,deadline:g.deadline||""});}} t={t}>Editar</SmBtn>
        <SmBtn onClick={()=>{if(window.confirm("¿Eliminar?"))setGoals(p=>p.filter(x=>x.id!==g.id));}} t={t} color={t.red}>✕</SmBtn>
      </div>
    </Card>
  );
}

function PlanTab({income,expenses,debts,loans,goals,setGoals,capital,monthlyHistory,t}) {
  const [horizon,   setHorizon]  = useState(24);
  const [addingGoal,setAddingGoal]=useState(false);
  const [newGoal,   setNewGoal]  = useState({label:"",target:"",saved:"0",priority:"alta",deadline:"",monthlyContrib:""});

  const nomina      = income.find(i=>i.id==="sal")?.amount||0;
  const loanIncome  = loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal*(l.rate/100),0);
  const totalExp    = expenses.reduce((s,e)=>s+e.amount,0);
  const surplus     = nomina+loanIncome-totalExp;
  const totalDebt   = debts.reduce((s,d)=>s+d.total,0);
  const totalContrib= goals.reduce((s,g)=>s+(g.monthlyContrib||0),0);
  const freeAfterGoals=surplus-totalContrib;

  // Projection
  const buildProj=(months)=>{
    let simDebts=debts.map(d=>({...d}));
    const simLoans=loans.filter(l=>l.status!=="inactive");
    return Array.from({length:months},(_,m)=>{
      const d=new Date();d.setMonth(d.getMonth()+m);
      const li=simLoans.reduce((s,l)=>s+l.principal*(l.rate/100),0);
      const debtP=simDebts.reduce((s,d)=>s+Math.min(d.monthlyPayment,d.total),0);
      const exp=totalExp-debts.reduce((s,d)=>s+d.monthlyPayment,0)+debtP;
      const sur=nomina+li-exp;
      const td=simDebts.reduce((s,d)=>s+d.total,0);
      simDebts=simDebts.map(d=>{
        if(d.type==="amortizing"&&d.total>0){const r=d.rate/100/12||0;return{...d,total:Math.max(0,d.total-Math.max(0,d.monthlyPayment-d.total*r))};}
        return d;
      });
      return{mk:d.toISOString().slice(0,7),sur,td,li};
    });
  };

  const proj=buildProj(horizon);
  const firstDebtFree=proj.find(r=>r.td<=0);
  const loanCoverAll=proj.find(r=>r.li>=totalExp);

  // History charts from monthlyHistory
  const histKeys=Object.keys(monthlyHistory).sort();
  const capHistory=histKeys.map(k=>({x:k.slice(5),y:monthlyHistory[k].capital||0}));
  const debtHistory=histKeys.map(k=>({x:k.slice(5),y:monthlyHistory[k].totalDebt||0}));
  const loanHistory=histKeys.map(k=>({x:k.slice(5),y:monthlyHistory[k].loanIncome||0}));

  const addGoal=()=>{
    if(!newGoal.label||!newGoal.target) return;
    setGoals(p=>[...p,{id:Date.now().toString(),...newGoal,target:+newGoal.target,saved:+newGoal.saved||0,monthlyContrib:+newGoal.monthlyContrib||0}]);
    setNewGoal({label:"",target:"",saved:"0",priority:"short",deadline:"",monthlyContrib:""});
    setAddingGoal(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
      {/* Top stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem"}}>
        <Card t={t} style={{padding:"0.8rem"}}>
          <Lbl t={t}>Superávit mensual</Lbl>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:surplus>=0?t.green:t.red}}>{surplus>=0?"+":""}{eur(surplus)}</div>
          <div style={{fontSize:"0.65rem",color:t.textTertiary,marginTop:"0.2rem"}}>{eur(nomina)} + {eur(loanIncome)} intereses</div>
        </Card>
        <Card t={t} style={{padding:"0.8rem"}}>
          <Lbl t={t}>Capital disponible</Lbl>
          <div style={{fontSize:"1.3rem",fontWeight:800,color:capital>=0?t.text:t.red}}>{eur(capital)}</div>
          <div style={{fontSize:"0.65rem",color:t.textTertiary,marginTop:"0.2rem"}}>saldo actual</div>
        </Card>
        <Card t={t} style={{padding:"0.8rem"}}>
          <Lbl t={t}>Asignado a objetivos</Lbl>
          <div style={{fontSize:"1.1rem",fontWeight:700,color:t.text}}>{eur(totalContrib)}/mes</div>
          <div style={{fontSize:"0.65rem",color:totalContrib>surplus?t.red:t.green,marginTop:"0.2rem"}}>
            {totalContrib>surplus?"⚠ supera superávit":eur(freeAfterGoals)+" libre"}
          </div>
        </Card>
        <Card t={t} style={{padding:"0.8rem"}}>
          <Lbl t={t}>Deuda total</Lbl>
          <div style={{fontSize:"1.1rem",fontWeight:700,color:t.red}}>{eur(totalDebt)}</div>
          {firstDebtFree&&<div style={{fontSize:"0.65rem",color:t.green,marginTop:"0.2rem"}}>libre en {firstDebtFree.mk}</div>}
        </Card>
      </div>

      {/* Goals grid */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Lbl t={t}>Objetivos y plazos</Lbl>
        <SmBtn onClick={()=>setAddingGoal(!addingGoal)} t={t}>+ Añadir</SmBtn>
      </div>

      {addingGoal&&(
        <Card t={t}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem",marginBottom:"0.5rem"}}>
            <Inp placeholder="Nombre del objetivo" value={newGoal.label} onChange={e=>setNewGoal(p=>({...p,label:e.target.value}))} t={t} style={{gridColumn:"span 2"}}/>
            <Inp type="number" placeholder="Meta €" value={newGoal.target} onChange={e=>setNewGoal(p=>({...p,target:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Aportación €/mes" value={newGoal.monthlyContrib} onChange={e=>setNewGoal(p=>({...p,monthlyContrib:e.target.value}))} t={t}/>
            <Inp type="number" placeholder="Ya ahorrado €" value={newGoal.saved} onChange={e=>setNewGoal(p=>({...p,saved:e.target.value}))} t={t}/>
            <Inp type="date" placeholder="Deadline" value={newGoal.deadline} onChange={e=>setNewGoal(p=>({...p,deadline:e.target.value}))} t={t}/>
            <Sel value={newGoal.priority} onChange={e=>setNewGoal(p=>({...p,priority:e.target.value}))} t={t} style={{gridColumn:"span 2"}}>
              <option value="alta">Alta prioridad</option>
              <option value="media">Media prioridad</option>
              <option value="baja">Baja prioridad</option>
            </Sel>
          </div>
          <div style={{display:"flex",gap:"0.35rem"}}>
            <PrimBtn onClick={addGoal} t={t}>Añadir objetivo</PrimBtn>
            <SmBtn onClick={()=>setAddingGoal(false)} t={t}>Cancelar</SmBtn>
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem"}}>
        {[...goals].sort((a,b)=>(PRIORITY_ORDER[a.priority]??1)-(PRIORITY_ORDER[b.priority]??1)).map(g=><GoalCard key={g.id} g={g} setGoals={setGoals} surplus={surplus} t={t}/>)}
      </div>

      {/* Horizon */}
      <div style={{display:"flex",gap:"3px",background:t.surfaceHover,borderRadius:"10px",padding:"3px"}}>
        {[6,12,24,36,60].map(m=>(
          <button key={m} onClick={()=>setHorizon(m)} style={{flex:1,padding:"0.42rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.72rem",fontWeight:700,background:horizon===m?t.surface:"transparent",color:horizon===m?t.text:t.textTertiary,transition:"all 0.15s"}}>
            {m<12?m+"m":(m/12)+"a"}
          </button>
        ))}
      </div>

      {/* Milestones */}
      <Card t={t}>
        <Lbl t={t}>Hitos proyectados — {horizon} meses</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
          {[
            {label:"Libre de deudas", val:firstDebtFree?firstDebtFree.mk:`>${horizon}m`, color:firstDebtFree?t.green:t.textTertiary},
            {label:"Independencia financiera", val:loanCoverAll?loanCoverAll.mk:`>${horizon}m`, color:loanCoverAll?t.blue:t.textTertiary},
          ].map(({label,val,color})=>(
            <div key={label} style={{background:t.surfaceHover,borderRadius:"10px",padding:"0.6rem"}}>
              <div style={{fontSize:"0.62rem",color:t.textTertiary,marginBottom:"0.2rem"}}>{label}</div>
              <div style={{fontSize:"0.85rem",fontWeight:700,color}}>{val}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Projection charts */}
      <Card t={t}>
        <Lbl t={t}>Superávit mensual proyectado</Lbl>
        <LineChart data={proj.map(r=>({x:r.mk.slice(5),y:r.sur}))} t={t} color={t.green} height={120}/>
      </Card>
      <Card t={t}>
        <Lbl t={t}>Evolución deuda total</Lbl>
        <LineChart data={proj.map(r=>({x:r.mk.slice(5),y:r.td}))} t={t} color={t.red} height={120}/>
      </Card>
      <Card t={t}>
        <Lbl t={t}>Intereses de cartera</Lbl>
        <LineChart data={proj.map(r=>({x:r.mk.slice(5),y:r.li}))} t={t} color={t.blue} height={120}/>
      </Card>

      {/* Monthly history */}
      {histKeys.length>0&&(
        <>
          <div style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:t.textTertiary}}>Historial real mes a mes</div>
          {capHistory.length>=2&&<Card t={t}><Lbl t={t}>Capital histórico</Lbl><LineChart data={capHistory} t={t} color={t.accent} height={110}/></Card>}
          {debtHistory.length>=2&&<Card t={t}><Lbl t={t}>Deuda histórica</Lbl><LineChart data={debtHistory} t={t} color={t.red} height={110}/></Card>}
          {loanHistory.length>=2&&<Card t={t}><Lbl t={t}>Intereses históricos</Lbl><LineChart data={loanHistory} t={t} color={t.blue} height={110}/></Card>}

          {/* History table */}
          <Card t={t}>
            <Lbl t={t}>Tabla histórica</Lbl>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.72rem"}}>
                <thead>
                  <tr>{["Mes","Capital","Deuda","Intereses"].map(h=><th key={h} style={{padding:"0.35rem 0.5rem",textAlign:"right",color:t.textTertiary,borderBottom:`1px solid ${t.border}`,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {histKeys.slice(-12).reverse().map((k,i)=>{
                    const h=monthlyHistory[k];
                    return(
                      <tr key={k} style={{background:i%2?t.surfaceHover:"transparent"}}>
                        <td style={{padding:"0.35rem 0.5rem",color:t.textSecondary}}>{k}</td>
                        <td style={{padding:"0.35rem 0.5rem",textAlign:"right",color:t.text,fontWeight:500}}>{eur(h.capital||0)}</td>
                        <td style={{padding:"0.35rem 0.5rem",textAlign:"right",color:t.red}}>{eur(h.totalDebt||0)}</td>
                        <td style={{padding:"0.35rem 0.5rem",textAlign:"right",color:t.green}}>{eur(h.loanIncome||0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      {histKeys.length===0&&(
        <div style={{textAlign:"center",padding:"1.5rem",color:t.textTertiary,fontSize:"0.78rem",background:t.surfaceHover,borderRadius:"12px"}}>
          El historial se irá acumulando mes a mes automáticamente.
        </div>
      )}

      {/* Capital allocation advisor */}
      {capital>50&&(()=>{
        const emergencyTarget = totalExp;
        const emergencyOk = capital >= emergencyTarget;
        const emergencyReserve = Math.min(capital, emergencyTarget);
        let pool = Math.max(0, capital - emergencyReserve);

        // Build priority-sorted suggestions
        const suggestions = [];

        // 1. Debts sorted by rate (highest first)
        const sortedDebts = debts.filter(d=>d.total>0).sort((a,b)=>b.rate-a.rate);
        for(const d of sortedDebts){
          if(pool<=0.5) break;
          const alloc = Math.min(pool*0.5, d.total);
          const base = calcPayoff(d.total,d.rate,d.monthlyPayment);
          const after = calcPayoff(Math.max(0,d.total-alloc),d.rate,d.monthlyPayment);
          const saving = base&&after?base.interest-after.interest:0;
          suggestions.push({
            type:"deuda", label:`Amortizar ${d.label}`, amount:alloc, color:"#EF4444",
            note:`${d.rate}%/mes · ahorras ${eur(saving)} en intereses`,
            priority:0,
          });
          pool -= alloc;
        }

        // 2. Goals sorted by priority then deadline
        const pendingGoals=[...goals.filter(g=>g.saved<g.target)].sort((a,b)=>{
          const po=(PRIORITY_ORDER[a.priority]??1)-(PRIORITY_ORDER[b.priority]??1);
          if(po!==0) return po;
          const da=a.deadline?new Date(a.deadline).getTime():9e12;
          const db=b.deadline?new Date(b.deadline).getTime():9e12;
          return da-db;
        });
        for(const g of pendingGoals){
          if(pool<=0.5) break;
          const pm=PRIORITY_META[g.priority]||PRIORITY_META.media;
          const alloc=Math.min(pool*0.6, g.target-g.saved);
          const moAfter=g.monthlyContrib>0?Math.ceil((g.target-g.saved-alloc)/g.monthlyContrib):null;
          suggestions.push({
            type:"objetivo", label:`${pm.label}: ${g.label}`, amount:alloc, color:pm.color,
            note:`quedan ${eur(Math.max(0,g.target-g.saved-alloc))}${moAfter?` · ${moAfter} meses`:""}`,
            priority:PRIORITY_ORDER[g.priority]??1,
          });
          pool-=alloc;
        }

        // 3. Loan expansion if no high-priority goals or debts left
        const activeLoans2=loans.filter(l=>l.status!=="inactive");
        if(pool>200&&activeLoans2.length>0){
          // eslint-disable-next-line no-unused-vars
          const loanInc2=activeLoans2.reduce((s,l)=>s+l.principal*(l.rate/100),0);
          suggestions.push({
            type:"prestamo", label:"Ampliar cartera de préstamos", amount:pool, color:"#3B82F6",
            note:`generaría ~${eur(pool*(activeLoans2[0]?.rate||15)/100)}/mes adicionales`,
            priority:3,
          });
          pool=0;
        }

        // 4. Buffer
        if(pool>0.5) suggestions.push({type:"buffer",label:"Buffer disponible",amount:pool,color:"#96CEB4",note:"para imprevistos o nuevas oportunidades",priority:99});

        const rows=[
          {label:"Reserva imprevistos (1 mes gastos)", amount:emergencyReserve, color:"#F7DC6F",
           note:emergencyOk?"colchón completo ✓":`recomendado ${eur(emergencyTarget)}`},
          ...suggestions,
        ].filter(r=>r.amount>0.5);

        return(
          <Card t={t}>
            <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:t.textTertiary,marginBottom:"0.6rem"}}>
              Consejo: cómo usar tus {eur(capital)} disponibles
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {rows.map((r,i)=>(
                <div key={i} style={{display:"flex",gap:"0.6rem",alignItems:"flex-start",padding:"0.55rem 0.65rem",background:r.color+"14",border:`1px solid ${r.color}30`,borderRadius:"10px"}}>
                  <div style={{width:10,height:10,borderRadius:3,background:r.color,flexShrink:0,marginTop:"0.15rem"}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.75rem",fontWeight:600,color:t.text}}>{r.label}</div>
                    <div style={{fontSize:"0.62rem",color:t.textTertiary,marginTop:"0.1rem"}}>{r.note}</div>
                  </div>
                  <div style={{fontSize:"1rem",fontWeight:800,color:r.color,flexShrink:0}}>{eur(r.amount)}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:"0.6rem",fontSize:"0.65rem",color:t.textTertiary,padding:"0.4rem 0.5rem",background:t.surfaceHover,borderRadius:"8px"}}>
              Orden: reserva → deudas (mayor interés) → objetivos (por prioridad) → préstamos → buffer
            </div>
          </Card>
        );
      })()}

      {/* Recomendaciones Plan */}
      <Card t={t} style={{background:t.surfaceHover}}>
        <Lbl t={t}>Notas del plan</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
          {surplus<0&&(
            <div style={{fontSize:"0.75rem",color:"#FF6B6B"}}>
              Déficit de {eur(Math.abs(surplus))}/mes. Revisa gastos o aumenta ingresos antes de asignar a objetivos.
            </div>
          )}
          {surplus>0&&totalContrib>surplus&&(
            <div style={{fontSize:"0.75rem",color:"#F7DC6F"}}>
              Aportaciones ({eur(totalContrib)}/mes) superan el superávit ({eur(surplus)}). Reduce alguna en {eur(totalContrib-surplus)}.
            </div>
          )}
          {surplus>0&&freeAfterGoals>50&&(
            <div style={{fontSize:"0.75rem",color:"#00B894"}}>
              {eur(freeAfterGoals)}/mes libres tras objetivos. Amortiza deuda o amplía cartera de préstamos.
            </div>
          )}
          {debts.filter(d=>d.type==="amortizing").map(d=>{
            const base=calcPayoff(d.total,d.rate,d.monthlyPayment);
            if(!base) return null;
            const extra50=calcPayoff(d.total,d.rate,d.monthlyPayment+50);
            const saving=extra50?base.interest-extra50.interest:0;
            return(
              <div key={d.id} style={{fontSize:"0.75rem",color:"#45B7D1"}}>
                {d.label}: +50€/mes adelanta {base.months-(extra50?.months||0)} meses y ahorra {eur(saving)} en intereses.
              </div>
            );
          })}
          {goals.filter(g=>g.deadline&&new Date(g.deadline)<Date.now()+3*30.44*24*3600000&&g.saved<g.target).map(g=>{
            const rem=g.target-g.saved;
            const days=Math.ceil((new Date(g.deadline)-Date.now())/(24*3600000));
            return(
              <div key={g.id} style={{fontSize:"0.75rem",color:"#F7DC6F"}}>
                "{g.label}" vence en {days} días. Necesitas {eur(rem)} más.
              </div>
            );
          })}
          {firstDebtFree&&(
            <div style={{fontSize:"0.75rem",color:"#45B7D1"}}>
              Libre de deudas en {firstDebtFree.mk} a este ritmo.
            </div>
          )}
          {surplus>0&&capital<totalExp&&(
            <div style={{fontSize:"0.75rem",color:"#F7DC6F"}}>
              Tu capital ({eur(capital)}) está por debajo de 1 mes de gastos ({eur(totalExp)}). Prioriza acumular reserva.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────────
function DesktopLayout({tab,setTab,income,setIncome,expenses,setExpenses,debts,setDebts,loans,setLoans,goals,setGoals,payments,setPayments,loanPayments,setLoanPayments,unexpectedExp,setUnexpectedExp,funLimit,setFunLimit,capital,setCapital,friendLoans,setFriendLoans,loanCollectionLog,setLoanCollectionLog,accounts,setAccounts,monthlyHistory,darkMode,setDarkMode,t}) {
  const TABS=[{id:"resumen",label:"Resumen"},{id:"ingresos",label:"Ingresos"},{id:"gastos",label:"Gastos"},{id:"deudas",label:"Deudas"},{id:"plan",label:"Plan"}];
  const loanIncome  = loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal*(l.rate/100),0);
  const loanCapitalD= loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal,0);
  const totalExp    = expenses.reduce((s,e)=>s+e.amount,0);
  const totalDebt   = debts.reduce((s,d)=>s+d.total,0);
  const patrimonioD = capital + loanCapitalD - totalDebt;
  const paid        = payments[mk()]||{};
  const paidTotal   = expenses.filter(e=>paid[e.id]).reduce((s,e)=>s+e.amount,0);

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
      {/* ── TOP HORIZONTAL HEADER ── */}
      <div style={{position:"sticky",top:0,zIndex:30,background:t.surface,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:"0",padding:"0 1.5rem",height:"54px",flexShrink:0}}>
        {/* Logo */}
        <div style={{display:"flex",flexDirection:"column",marginRight:"2rem",flexShrink:0}}>
          <div style={{fontSize:"0.9rem",fontWeight:700,color:t.text,letterSpacing:"-0.02em"}}>Finanzas</div>
          <div style={{fontSize:"0.55rem",color:t.textTertiary,letterSpacing:"0.04em",textTransform:"uppercase"}}>tracker</div>
        </div>

        {/* Key stats */}
        <div style={{display:"flex",gap:"0",flex:1,alignItems:"center"}}>
          {[
            {label:"Patrimonio", val:eur(patrimonioD), color:patrimonioD>=0?t.green:t.red},
            {label:"Capital",    val:eur(capital),     color:capital>=0?t.text:t.red},
            {label:"Intereses",  val:eur(loanIncome)+"/mes", color:t.blue},
            {label:"Deuda",      val:eur(totalDebt),   color:t.red},
          ].map(({label,val,color},i)=>(
            <div key={label} style={{paddingLeft:"1.25rem",paddingRight:"1.25rem",borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:"1px"}}>
              <div style={{fontSize:"0.55rem",color:t.textTertiary,letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:700}}>{label}</div>
              <div style={{fontSize:"0.82rem",fontWeight:700,color,letterSpacing:"-0.01em"}}>{val}</div>
            </div>
          ))}
          {/* Payments progress */}
          <div style={{paddingLeft:"1.25rem",paddingRight:"1.25rem",display:"flex",flexDirection:"column",gap:"4px",minWidth:"120px"}}>
            <div style={{fontSize:"0.55rem",color:t.textTertiary,letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:700}}>Pagos</div>
            <ProgBar value={paidTotal} max={totalExp||1} color={t.green} t={t} height={4}/>
            <div style={{fontSize:"0.6rem",color:t.textTertiary}}>{eur(paidTotal)} / {eur(totalExp)}</div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{display:"flex",gap:"2px",background:t.surfaceHover,borderRadius:"10px",padding:"3px",marginRight:"1rem",flexShrink:0}}>
          {TABS.map(tb=>(
            <button key={tb.id} onClick={()=>setTab(tb.id)}
              style={{padding:"0.38rem 0.75rem",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.78rem",fontWeight:tab===tb.id?700:500,background:tab===tb.id?t.surface:"transparent",color:tab===tb.id?t.text:t.textTertiary,transition:"all 0.15s",fontFamily:"inherit"}}>
              {tb.label}
            </button>
          ))}
        </nav>

        {/* Dark mode */}
        <button onClick={()=>setDarkMode(!darkMode)}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:"8px",padding:"0.32rem 0.6rem",color:t.textSecondary,fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
          {darkMode?"☀ Claro":"☾ Oscuro"}
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,padding:"1.75rem 2rem",width:"100%",maxWidth:tab==="resumen"?1200:760,boxSizing:"border-box",margin:"0 auto"}}>
        {tab==="resumen"  &&<ResumenTab income={income} expenses={expenses} loans={loans} debts={debts} goals={goals} payments={payments} capital={capital} monthlyHistory={monthlyHistory} t={t} wide={true}/>}
        {tab==="ingresos" &&<IngresosTab income={income} setIncome={setIncome} loans={loans} setLoans={setLoans} expenses={expenses} payments={payments} loanPayments={loanPayments} setLoanPayments={setLoanPayments} capital={capital} setCapital={setCapital} friendLoans={friendLoans} setFriendLoans={setFriendLoans} loanCollectionLog={loanCollectionLog} setLoanCollectionLog={setLoanCollectionLog} accounts={accounts} setAccounts={setAccounts} t={t}/>}
        {tab==="gastos"   &&<GastosTab expenses={expenses} setExpenses={setExpenses} payments={payments} setPayments={setPayments} unexpectedExp={unexpectedExp} setUnexpectedExp={setUnexpectedExp} funLimit={funLimit} setFunLimit={setFunLimit} capital={capital} setCapital={setCapital} t={t}/>}
        {tab==="deudas"   &&<DeudasTab debts={debts} setDebts={setDebts} capital={capital} t={t}/>}
        {tab==="plan"     &&<PlanTab income={income} expenses={expenses} debts={debts} loans={loans} goals={goals} setGoals={setGoals} capital={capital} monthlyHistory={monthlyHistory} t={t}/>}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS=[{id:"resumen",label:"Resumen"},{id:"ingresos",label:"Ingresos"},{id:"gastos",label:"Gastos"},{id:"deudas",label:"Deudas"},{id:"plan",label:"Plan"}];

export default function App() {
  const [unlocked,      setUnlocked]     = useState(()=>localStorage.getItem("fz_pin_v1")==="ok");
  const [darkMode,      setDarkMode]     = useLS("fz_dark_v1",    true);
  const [tab,           setTab]          = useState("resumen");
  const [income,        setIncome]       = useLS("fz_income_v4",  DEFAULT_INCOME);
  const [expenses,      setExpenses]     = useLS("fz_expenses_v4",DEFAULT_EXPENSES);
  const [debts,         setDebts]        = useLS("fz_debts_v4",   DEFAULT_DEBTS);
  const [loans,         setLoans]        = useLS("fz_loans_v4",   DEFAULT_LOANS);
  const [goals,         setGoals]        = useLS("fz_goals_v4",   DEFAULT_GOALS);
  const [payments,      setPayments]     = useLS("fz_payments_v3",{});
  const [loanPayments,  setLoanPayments] = useLS("fz_loanpay_v1", {});
  const [unexpectedExp, setUnexpectedExp]= useLS("fz_unexp_v1",   {});
  const [funLimit,      setFunLimit]     = useLS("fz_funlim_v1",  100);
  const [capital,       setCapital]      = useLS("fz_capital_v3", 0);
  const [friendLoans,       setFriendLoans]      = useLS("fz_friendloans_v1",  DEFAULT_FRIEND_LOANS);
  const [loanCollectionLog, setLoanCollectionLog]= useLS("fz_loancolllog_v1", []);
  const [accounts,          setAccounts]         = useLS("fz_accounts_v1",    DEFAULT_ACCOUNTS);
  const [monthlyHistory,setMonthlyHistory]=useLS("fz_history_v1", {});
  const [lastSnapMk,    setLastSnapMk]   = useLS("fz_snapmk_v1",  "");
  const syncTimer = useRef(null);

  const winWidth  = useWindowWidth();
  const isDesktop = winWidth >= 960;
  const t         = darkMode ? DARK : LIGHT;

  // ── Monthly snapshot: auto-save at start of new month ──
  useEffect(() => {
    const currentMk = mk();
    if (lastSnapMk && lastSnapMk !== currentMk) {
      setMonthlyHistory(p => ({
        ...p,
        [lastSnapMk]: {
          capital,
          totalDebt:   debts.reduce((s,d)=>s+d.total,0),
          loanIncome:  loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal*(l.rate/100),0),
          totalIncome: income.reduce((s,i)=>s+i.amount,0),
          totalExp:    expenses.reduce((s,e)=>s+e.amount,0),
          goalSnapshots: goals.reduce((acc,g)=>({...acc,[g.id]:{saved:g.saved,label:g.label}}),{}),
        }
      }));
    }
    setLastSnapMk(currentMk);
  }, []); // eslint-disable-line

  // ── Supabase: restaurar sesión si ya estaba desbloqueado ──
  useEffect(()=>{
    if(unlocked){
      supabase.auth.getSession().then(({data:{session}})=>{
        if(!session){
          supabase.auth.signInWithPassword({email:"thewolf536@gmail.com",password:"ElGuesoPara27YT"});
        }
      });
    }
  },[unlocked]); // eslint-disable-line

  // ── Supabase: pull on mount ──
  useEffect(()=>{
    (async()=>{
      try{
        const {data,error}=await supabase.from("finanzas_data").select("payload,updated_at").eq("id",SYNC_ROW).single();
        if(error||!data) return;
        const remote=data.payload;
        if(!remote) return;
        // Use remote data to populate state (remote wins on mount)
        if(remote.income)        setIncome(remote.income);
        if(remote.expenses)      setExpenses(remote.expenses);
        if(remote.debts)         setDebts(remote.debts);
        if(remote.loans)         setLoans(remote.loans);
        if(remote.goals)         setGoals(remote.goals);
        if(remote.payments)      setPayments(remote.payments);
        if(remote.loanPayments)  setLoanPayments(remote.loanPayments);
        if(remote.unexpectedExp) setUnexpectedExp(remote.unexpectedExp);
        if(remote.funLimit!=null)setFunLimit(remote.funLimit);
        if(remote.capital!=null) setCapital(remote.capital);
        if(remote.friendLoans)   setFriendLoans(remote.friendLoans);
        if(remote.loanCollectionLog) setLoanCollectionLog(remote.loanCollectionLog);
        if(remote.accounts)      setAccounts(remote.accounts);
        if(remote.monthlyHistory)setMonthlyHistory(remote.monthlyHistory);
        if(remote.darkMode!=null)setDarkMode(remote.darkMode);
      }catch(e){}
    })();
  },[]); // eslint-disable-line

  // ── Supabase: push on change (debounced 3s) ──
  useEffect(()=>{
    if(syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(async()=>{
      const payload={income,expenses,debts,loans,goals,payments,loanPayments,unexpectedExp,funLimit,capital,friendLoans,loanCollectionLog,accounts,monthlyHistory,darkMode};
      try{
        await supabase.from("finanzas_data").upsert({id:SYNC_ROW,payload,updated_at:new Date().toISOString()});
      }catch(e){}
    },3000);
    return()=>clearTimeout(syncTimer.current);
  },[income,expenses,debts,loans,goals,payments,loanPayments,unexpectedExp,funLimit,capital,friendLoans,loanCollectionLog,accounts,monthlyHistory,darkMode]); // eslint-disable-line

  const loanCapitalA = loans.filter(l=>l.status!=="inactive").reduce((s,l)=>s+l.principal,0);
  const totalDebtA   = debts.reduce((s,d)=>s+d.total,0);
  const patrimonioA  = capital + loanCapitalA - totalDebtA;

  if(!unlocked) return <PinScreen onUnlock={()=>setUnlocked(true)} t={t}/>;

  if (isDesktop) return (
    <DesktopLayout tab={tab} setTab={setTab} income={income} setIncome={setIncome} expenses={expenses} setExpenses={setExpenses} debts={debts} setDebts={setDebts} loans={loans} setLoans={setLoans} goals={goals} setGoals={setGoals} payments={payments} setPayments={setPayments} loanPayments={loanPayments} setLoanPayments={setLoanPayments} unexpectedExp={unexpectedExp} setUnexpectedExp={setUnexpectedExp} funLimit={funLimit} setFunLimit={setFunLimit} capital={capital} setCapital={setCapital} friendLoans={friendLoans} setFriendLoans={setFriendLoans} loanCollectionLog={loanCollectionLog} setLoanCollectionLog={setLoanCollectionLog} accounts={accounts} setAccounts={setAccounts} monthlyHistory={monthlyHistory} darkMode={darkMode} setDarkMode={setDarkMode} t={t}/>
  );

  return(
    <div style={{minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",maxWidth:"480px",margin:"0 auto"}}>
      <div style={{padding:"0.85rem 1.1rem 0",background:t.bg,borderBottom:`1px solid ${t.border}`,position:"sticky",top:0,zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.7rem"}}>
          <div>
            <div style={{color:t.text,fontSize:"1rem",fontWeight:700,letterSpacing:"-0.02em"}}>
              {TABS.find(tb=>tb.id===tab)?.label||"Finanzas"}
            </div>
            <div style={{color:t.textTertiary,fontSize:"0.67rem",marginTop:"0.04rem"}}>
              capital {eur(capital)} · patrimonio {eur(patrimonioA)}
            </div>
          </div>
          <button onClick={()=>setDarkMode(!darkMode)} style={{background:t.accentMuted,border:"none",borderRadius:"8px",padding:"0.3rem 0.48rem",color:t.textSecondary,fontSize:"0.88rem",cursor:"pointer"}}>{darkMode?"☀️":"🌙"}</button>
        </div>
        <div style={{display:"flex",gap:"0",marginBottom:"-1px"}}>
          {TABS.map(tb=>(
            <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:"0.58rem 0",background:"transparent",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===tb.id?t.accent:"transparent"}`,transition:"all 0.2s",fontFamily:"inherit"}}>
              <div style={{fontSize:"0.72rem",fontWeight:tab===tb.id?700:500,color:tab===tb.id?t.text:t.textTertiary}}>{tb.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"1.1rem"}}>
        {tab==="resumen"  &&<ResumenTab income={income} expenses={expenses} loans={loans} debts={debts} goals={goals} payments={payments} capital={capital} monthlyHistory={monthlyHistory} t={t}/>}
        {tab==="ingresos" &&<IngresosTab income={income} setIncome={setIncome} loans={loans} setLoans={setLoans} expenses={expenses} payments={payments} loanPayments={loanPayments} setLoanPayments={setLoanPayments} capital={capital} setCapital={setCapital} friendLoans={friendLoans} setFriendLoans={setFriendLoans} loanCollectionLog={loanCollectionLog} setLoanCollectionLog={setLoanCollectionLog} accounts={accounts} setAccounts={setAccounts} t={t}/>}
        {tab==="gastos"   &&<GastosTab expenses={expenses} setExpenses={setExpenses} payments={payments} setPayments={setPayments} unexpectedExp={unexpectedExp} setUnexpectedExp={setUnexpectedExp} funLimit={funLimit} setFunLimit={setFunLimit} capital={capital} setCapital={setCapital} t={t}/>}
        {tab==="deudas"   &&<DeudasTab debts={debts} setDebts={setDebts} capital={capital} t={t}/>}
        {tab==="plan"     &&<PlanTab income={income} expenses={expenses} debts={debts} loans={loans} goals={goals} setGoals={setGoals} capital={capital} monthlyHistory={monthlyHistory} t={t}/>}
      </div>
      <div style={{height:"2rem"}}/>
    </div>
  );
}
