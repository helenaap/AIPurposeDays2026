import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ─── Design tokens (Conchita 2.0 / Wallapop PRO) ─────────────────────────────
const T = {
  bgBase:     "#FFFFFF",
  bgLow:      "#F0F3F5",
  bgMid:      "#D1DBE0",
  bgHigh:     "#29363D",
  contentHi:  "#29363D",
  contentMid: "#5C7A89",
  contentLo:  "#A3B8C1",
  onHigh:     "#FFFFFF",
  brandMid:   "#038673",
  brandLow:   "#3DD2BA",
  blueBanner: "#7FC7FD",
  blueHigh:   "#0B2DB0",
  magenta:    "#D32069",
  orange:     "#F49709",
};

// ─── Spring presets ───────────────────────────────────────────────────────────
const SP = {
  nav:     { type: "spring", stiffness: 320, damping: 34, mass: 1 },
  pack:    { type: "spring", stiffness: 400, damping: 28 },
  btn:     { type: "spring", stiffness: 500, damping: 30 },
  confetti:{ type: "spring", stiffness: 120, damping: 14 },
};

// ─── Wallie font stack ────────────────────────────────────────────────────────
const CHUNKY = `"Nunito", -apple-system, "SF Pro Display", sans-serif`;
const FIT    = `"Nunito", -apple-system, "SF Pro Text", sans-serif`;

// ─── Pack data ────────────────────────────────────────────────────────────────
const PACKS = {
  city: [
    { id:"c1", name:"100 City Bumps",  detail:"1 day per listing", price:"9,00 €/month",  today:"5,50 €",  bumps:100, newPlan:"58,00 €/month", best:false },
    { id:"c2", name:"250 City Bumps",  detail:"1 day per listing", price:"19,00 €/month", today:"11,00 €", bumps:250, newPlan:"68,00 €/month", best:false },
    { id:"c3", name:"500 City Bumps",  detail:"1 day per listing", price:"29,00 €/month", today:"18,00 €", bumps:500, newPlan:"78,00 €/month", best:false },
    { id:"c4", name:"700 City Bumps",  detail:"1 day per listing", price:"39,00 €/month", today:"22,00 €", bumps:700, newPlan:"88,00 €/month", best:true  },
  ],
  country: [
    { id:"n1", name:"100 Country Bumps",  detail:"1 day per listing", price:"12,00 €/month", today:"7,00 €",  bumps:100, newPlan:"61,00 €/month", best:false },
    { id:"n2", name:"250 Country Bumps",  detail:"1 day per listing", price:"22,00 €/month", today:"13,00 €", bumps:250, newPlan:"71,00 €/month", best:false },
    { id:"n3", name:"500 Country Bumps",  detail:"1 day per listing", price:"32,00 €/month", today:"19,00 €", bumps:500, newPlan:"81,00 €/month", best:false },
    { id:"n4", name:"700 Country Bumps",  detail:"1 day per listing", price:"44,00 €/month", today:"26,00 €", bumps:700, newPlan:"93,00 €/month", best:true  },
  ],
};

// ─── Screen order for push navigation ────────────────────────────────────────
const SCREENS = ["manage", "select", "summary", "success"];

// ─── iOS Navigation stack (slide left/right with parallax) ───────────────────
function NavStack({ screen, direction }) {
  return (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={screen}
        custom={direction}
        variants={{
          enter:  (d) => ({ x: d > 0 ? 393  : -393, opacity: 1 }),
          center: { x: 0, opacity: 1 },
          exit:   (d) => ({ x: d > 0 ? -120 : 120,  opacity: 1 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={SP.nav}
        style={{ position:"absolute", inset:0, willChange:"transform" }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = ({ hi }) => (
  <div style={{ height: hi ? 1 : 2, background: hi ? T.bgMid : T.bgLow, width:"100%", flexShrink:0 }} />
);

// ─── Status bar ───────────────────────────────────────────────────────────────
function StatusBar({ light = false }) {
  const c = light ? T.onHigh : T.contentHi;
  return (
    <div style={{ height:50, display:"flex", alignItems:"flex-end", justifyContent:"space-between",
                  padding:"0 18px 12px 28px", flexShrink:0 }}>
      <span style={{ fontFamily:CHUNKY, fontSize:13, fontWeight:800, color:c }}>9:41</span>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <rect x="0" y="6" width="3" height="6" rx="1" opacity=".4"/><rect x="4" y="4" width="3" height="8" rx="1" opacity=".6"/><rect x="8" y="2" width="3" height="10" rx="1"/><rect x="12" y="0" width="3" height="12" rx="1"/>
        </svg>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <rect x=".5" y=".5" width="17" height="11" rx="3.5" stroke={c} strokeOpacity=".35"/>
          <rect x="2" y="2" width="13" height="8" rx="2" fill={c}/>
          <path d="M19 4v4a2 2 0 0 0 0-4Z" fill={c} fillOpacity=".4"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Nav bar ──────────────────────────────────────────────────────────────────
function NavBar({ title, onBack, rightLabel, onRight, light = false }) {
  const c = light ? T.onHigh : T.contentHi;
  return (
    <div style={{ height:48, display:"flex", alignItems:"center", padding:"0 4px", flexShrink:0 }}>
      {onBack ? (
        <motion.button whileTap={{ scale:0.88 }} transition={SP.btn}
          onClick={onBack}
          style={{ width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center",
                   border:"none", background:"transparent", cursor:"pointer", borderRadius:100 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </motion.button>
      ) : <div style={{ width:48 }} />}

      {title && (
        <span style={{ flex:1, textAlign:"center", fontFamily:CHUNKY, fontSize:16,
                       fontWeight:800, color:c, overflow:"hidden", textOverflow:"ellipsis",
                       whiteSpace:"nowrap", padding:"0 8px" }}>
          {title}
        </span>
      )}
      {!title && <div style={{ flex:1 }} />}

      {rightLabel ? (
        <span onClick={onRight} style={{ fontFamily:CHUNKY, fontSize:14, fontWeight:800,
                                         color: T.brandMid, padding:"6px 12px", cursor:"pointer" }}>
          {rightLabel}
        </span>
      ) : <div style={{ width:48 }} />}
    </div>
  );
}

// ─── Bottom bar ───────────────────────────────────────────────────────────────
function BottomBar({ children }) {
  return (
    <div style={{ padding:"12px 16px", background:T.bgBase, flexShrink:0,
                  boxShadow:"0 -3px 8px rgba(37,50,56,.08), 0 -8px 16px rgba(37,50,56,.05)" }}>
      {children}
    </div>
  );
}

// ─── Buttons (Conchita 2.0) ───────────────────────────────────────────────────
function BtnPrimary({ children, onClick, loading }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }} transition={SP.btn}
      onClick={onClick}
      style={{ background:T.bgHigh, color:T.onHigh, border:"none", borderRadius:100,
               padding:"12px 24px", fontSize:16, fontWeight:800, fontFamily:CHUNKY,
               cursor:"pointer", width:"100%", height:48, display:"flex",
               alignItems:"center", justifyContent:"center", gap:8 }}>
      {loading ? <Spinner color={T.onHigh} /> : children}
    </motion.button>
  );
}

function BtnBrand({ children, onClick, loading }) {
  return (
    <motion.button
      whileTap={{ scale: loading ? 1 : 0.97 }} transition={SP.btn}
      onClick={onClick}
      style={{ background:T.brandLow, color:T.contentHi, border:"none", borderRadius:100,
               padding:"12px 24px", fontSize:16, fontWeight:800, fontFamily:CHUNKY,
               cursor: loading ? "default" : "pointer", width:"100%", height:48,
               display:"flex", alignItems:"center", justifyContent:"center", gap:8,
               opacity: loading ? 0.85 : 1 }}>
      {loading ? <Spinner color={T.contentHi} /> : children}
    </motion.button>
  );
}

function BtnSecondary({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }} transition={SP.btn}
      onClick={onClick}
      style={{ background:"transparent", color:T.contentHi, border:`2px solid ${T.contentHi}`,
               borderRadius:100, padding:"11px 24px", fontSize:16, fontWeight:800,
               fontFamily:CHUNKY, cursor:"pointer", width:"100%", height:48,
               display:"flex", alignItems:"center", justifyContent:"center" }}>
      {children}
    </motion.button>
  );
}

function BtnOutlineBrand({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }} transition={SP.btn}
      onClick={onClick}
      style={{ background:"transparent", color:T.contentHi, border:`2px solid ${T.brandLow}`,
               borderRadius:100, padding:"8px 24px", fontSize:16, fontWeight:800,
               fontFamily:CHUNKY, cursor:"pointer", display:"inline-flex",
               alignItems:"center", justifyContent:"center" }}>
      {children}
    </motion.button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color = T.contentHi, size = 20 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}
      style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="2" strokeOpacity=".25"/>
        <path d="M18 10A8 8 0 0 0 10 2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </motion.div>
  );
}

// ─── Radio button ─────────────────────────────────────────────────────────────
function Radio({ selected }) {
  return (
    <motion.div
      animate={{ background: selected ? T.bgHigh : T.bgLow,
                 borderColor: selected ? T.bgHigh : T.contentMid }}
      transition={SP.pack}
      style={{ width:24, height:24, borderRadius:100, border:`2px solid`, flexShrink:0,
               display:"flex", alignItems:"center", justifyContent:"center" }}>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
            transition={{ type:"spring", stiffness:500, damping:25 }}
            style={{ width:12, height:12, borderRadius:100, background:T.onHigh }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Thin tabs ────────────────────────────────────────────────────────────────
function ThinTabs({ tabs, active, onChange }) {
  return (
    <div style={{ background:T.bgLow, borderRadius:99999, display:"inline-flex", padding:"0" }}>
      {tabs.map((t, i) => (
        <motion.button key={t} onClick={() => onChange(i)}
          whileTap={{ scale:0.95 }} transition={SP.btn}
          style={{ height:32, padding:"0 16px", display:"flex", alignItems:"center",
                   fontFamily:CHUNKY, fontSize:14, fontWeight:800,
                   color: i === active ? T.onHigh : T.contentHi,
                   background: i === active ? T.bgHigh : "transparent",
                   border:"none", borderRadius:100, cursor:"pointer", whiteSpace:"nowrap" }}>
          {t}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Bottom tab bar ───────────────────────────────────────────────────────────
const TAB_ICONS = {
  Inicio:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Favoritos: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Súbelo:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Buzón:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Tú:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

function AppTabBar({ activeTab = "Tú", onTab }) {
  return (
    <div style={{ display:"flex", height:49, borderTop:`1px solid ${T.bgMid}`,
                  background:T.bgBase, flexShrink:0 }}>
      {Object.keys(TAB_ICONS).map(label => {
        const isActive = label === activeTab;
        return (
          <motion.button key={label}
            whileTap={{ scale:0.88 }} transition={SP.btn}
            onClick={() => onTab?.(label)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                     justifyContent:"center", gap:2, paddingTop:4,
                     fontFamily: isActive ? CHUNKY : FIT,
                     fontSize:10, fontWeight: isActive ? 800 : 400,
                     color: isActive ? T.contentHi : T.contentMid,
                     border:"none", background:"transparent", cursor:"pointer" }}>
            <div style={{ color: isActive ? T.contentHi : T.contentMid }}>
              {TAB_ICONS[label]}
            </div>
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Home indicator ───────────────────────────────────────────────────────────
function HomeIndicator() {
  return (
    <div style={{ height:34, display:"flex", alignItems:"center", justifyContent:"center",
                  background:T.bgBase, flexShrink:0, paddingBottom:8 }}>
      <div style={{ width:134, height:5, background:T.contentHi, borderRadius:100 }} />
    </div>
  );
}

// ─── Card component (Conchita: 1px #A3B8C1, 16px radius) ─────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background:T.bgBase, border:`1px solid ${T.contentLo}`,
                  borderRadius:16, overflow:"hidden", ...style }}>
      {children}
    </div>
  );
}

// ─── Info box ─────────────────────────────────────────────────────────────────
function InfoBox({ title, children }) {
  return (
    <div style={{ background:T.bgLow, borderRadius:16, padding:14 }}>
      <div style={{ fontFamily:CHUNKY, fontSize:13, fontWeight:800, color:T.contentHi, marginBottom:8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Visa logo SVG ─────────────────────────────────────────────────────────────
function VisaLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
      <rect width="48" height="48" rx="6" fill="#1A1F71"/>
      <path d="M20.4 30H17.9l1.7-12H22L20.4 30ZM16.1 18 13.6 26.1 13.3 24.6 12.3 19c-.1-.4-.3-1-1.5-1H6.9L6.8 18.3s1.3.3 2.9 1.2L12 30h2.9L19.5 18h-3.4ZM39.8 30H42L40 18h-2c-.9 0-1.2.7-1.2.7l-4.3 11.3H35l.6-1.4h3.5l.7 1.4ZM36.5 26.4l1.4-4 .8 4h-2.2ZM32 20.8l.4-2.4s-1.2-.4-2.6-.4c-1.5 0-5 .7-5 3.9 0 3 3.9 3 3.9 4.6s-3.5 1.3-4.6.3l-.4 2.5s1.2.7 3.2.7c2 0 5-.9 5-3.8 0-3-3.9-3.3-3.9-4.6s2.8-1.2 4-.8Z" fill="white"/>
    </svg>
  );
}

// ─── Confetti particle system ─────────────────────────────────────────────────
const CONFETTI_COLORS = [T.brandLow, T.brandMid, T.contentHi, T.magenta, T.blueBanner, T.orange];

function ConfettiParticle({ originX, originY, index }) {
  const angle  = (index / 28) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
  const speed  = 120 + Math.random() * 200;
  const tx     = Math.cos(angle) * speed;
  const ty     = Math.sin(angle) * speed - 80;
  const color  = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size   = 6 + Math.random() * 6;
  const isRect = index % 3 !== 0;
  const delay  = Math.random() * 0.08;

  return (
    <motion.div
      initial={{ x: originX, y: originY, scale: 0, opacity: 1, rotate: 0 }}
      animate={{ x: originX + tx, y: originY + ty + 120, scale: 1, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
      transition={{ duration: 0.9 + Math.random() * 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:"absolute", width: isRect ? size : size * 0.6, height: isRect ? size * 0.4 : size,
        borderRadius: isRect ? 2 : size / 2, background: color,
        pointerEvents:"none", zIndex: 50,
      }}
    />
  );
}

function ConfettiBurst({ originX, originY, active }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      <AnimatePresence>
        {active && Array.from({ length: 28 }).map((_, i) => (
          <ConfettiParticle key={i} originX={originX} originY={originY} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Check circle (success icon) ─────────────────────────────────────────────
function CheckCircle({ visible }) {
  return (
    <div style={{ position:"relative", width:140, height:140 }}>
      {/* Outer ring */}
      <motion.div
        initial={{ scale:0.5, opacity:0 }}
        animate={visible ? { scale:1, opacity:1 } : { scale:0.5, opacity:0 }}
        transition={{ type:"spring", stiffness:250, damping:20, delay:0.05 }}
        style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#E3F8F4" }} />
      {/* Inner ring */}
      <motion.div
        initial={{ scale:0.5, opacity:0 }}
        animate={visible ? { scale:1, opacity:1 } : { scale:0.5, opacity:0 }}
        transition={{ type:"spring", stiffness:280, damping:22, delay:0.12 }}
        style={{ position:"absolute", inset:16, borderRadius:"50%", background:`${T.brandLow}33` }} />
      {/* Circle */}
      <motion.div
        initial={{ scale:0 }}
        animate={visible ? { scale:1 } : { scale:0 }}
        transition={{ type:"spring", stiffness:350, damping:20, delay:0.2 }}
        style={{ position:"absolute", inset:30, borderRadius:"50%", background:T.brandLow,
                 display:"flex", alignItems:"center", justifyContent:"center" }}>
        <motion.svg
          initial={{ pathLength:0 }}
          animate={visible ? { pathLength:1 } : { pathLength:0 }}
          width="40" height="40" viewBox="0 0 40 40" fill="none"
          transition={{ duration:0.4, delay:0.38, ease:"easeOut" }}>
          <motion.path d="M10 20l8 8 14-16" stroke="white" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength:0 }} animate={visible ? { pathLength:1 } : { pathLength:0 }}
            transition={{ duration:0.35, delay:0.38, ease:"easeOut" }} />
        </motion.svg>
      </motion.div>
    </div>
  );
}

// ─── Screen 1: Manage Subscription ───────────────────────────────────────────
function ScreenManage({ navigate }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:T.bgBase, overflow:"hidden" }}>
      <StatusBar />
      <NavBar title="Wallapop PRO" rightLabel="Help" />

      <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"0 16px", overflow:"hidden" }}>
        <div style={{ padding:"8px 0 12px", flexShrink:0 }}>
          <ThinTabs tabs={["Subscriptions","Invoices"]} active={0} onChange={() => {}} />
        </div>

        <Card style={{ paddingTop:16, position:"relative", flexShrink:0 }}>
          <div style={{ position:"absolute", right:15, top:15, cursor:"pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.contentMid} strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>

          <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <div style={{ fontFamily:CHUNKY, fontSize:24, fontWeight:800, color:T.contentHi }}>Cars</div>
              <div style={{ fontFamily:CHUNKY, fontSize:16, fontWeight:800, color:T.contentHi }}>Plan 20 articles</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <div style={{ fontFamily:FIT, fontSize:20, fontWeight:400, color:T.contentHi }}>49,00 €/mes</div>
              <div style={{ fontFamily:FIT, fontSize:14, color:T.contentMid }}>Next payment: 20/03/2026</div>
            </div>

            {/* PRO exclusive Bumps banner */}
            <motion.div
              whileTap={{ scale:0.98 }} transition={SP.btn}
              onClick={() => navigate("select", 1)}
              style={{ background:T.blueBanner, borderRadius:16, padding:"12px 16px",
                       display:"flex", gap:12, alignItems:"center", cursor:"pointer" }}>
              <div style={{ flex:1 }}>
                <div style={{ background:T.magenta, color:"#fff", fontFamily:CHUNKY, fontSize:11,
                              fontWeight:800, padding:"2px 8px", borderRadius:16,
                              display:"inline-block", marginBottom:4 }}>
                  PRO exclusive
                </div>
                <div style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.blueHigh }}>Bumps packs</div>
                <div style={{ fontFamily:FIT, fontSize:13, color:T.blueHigh, marginTop:2, lineHeight:"18px" }}>
                  Give more visibility to your listings every month
                </div>
              </div>
              <motion.button
                whileTap={{ scale:0.94 }} transition={SP.btn}
                style={{ background:"white", color:T.blueHigh, fontFamily:CHUNKY, fontSize:13,
                         fontWeight:800, padding:"6px 14px", borderRadius:100,
                         border:"none", cursor:"pointer", whiteSpace:"nowrap" }}>
                See more
              </motion.button>
            </motion.div>
          </div>

          <Divider hi />
          <motion.div whileTap={{ background:T.bgLow }} transition={{ duration:0.1 }}
            style={{ padding:"0 16px", height:56, display:"flex", alignItems:"center",
                     justifyContent:"space-between", cursor:"pointer" }}>
            <span style={{ fontFamily:FIT, fontSize:16, color:T.contentHi }}>See all benefits included</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.contentHi} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.div>
        </Card>

        <div style={{ display:"flex", justifyContent:"center", padding:"20px 0", flexShrink:0 }}>
          <BtnOutlineBrand>Add new subscription</BtnOutlineBrand>
        </div>
        <div style={{ flex:1 }} />
      </div>

      <AppTabBar activeTab="Tú" />
      <HomeIndicator />
    </div>
  );
}

// ─── Pack card (Card Select component) ───────────────────────────────────────
function PackCard({ pack, selected, onSelect }) {
  return (
    <motion.div
      whileTap={{ scale:0.975 }} transition={SP.pack}
      onClick={onSelect}
      animate={{ borderColor: selected ? T.contentHi : T.contentLo,
                 borderWidth: selected ? 2 : 1 }}
      style={{ background:T.bgBase, border:`${selected ? 2 : 1}px solid ${selected ? T.contentHi : T.contentLo}`,
               borderRadius:16, overflow:"hidden", cursor:"pointer" }}>
      <div style={{ padding:"4px 12px 0" }}>
        <div style={{ display:"flex", alignItems:"flex-start", padding:"10px 0",
                      position:"relative", minHeight:72 }}>
          <div style={{ flex:1, paddingRight:30 }}>
            <div style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi }}>
              {pack.name}
            </div>
            <div style={{ fontFamily:FIT, fontSize:13, color:T.contentMid, marginTop:2 }}>
              {pack.detail}
            </div>
          </div>
          <div style={{ position:"absolute", right:12, top:10 }}>
            <Radio selected={selected} />
          </div>
        </div>
        <Divider hi />
      </div>
      <div style={{ padding:"4px 12px 10px", textAlign:"right" }}>
        {pack.best && (
          <div style={{ fontFamily:CHUNKY, fontSize:11, fontWeight:800, color:T.magenta, marginBottom:2 }}>
            BEST VALUE
          </div>
        )}
        <div style={{ fontFamily:CHUNKY, fontSize:19, fontWeight:800, color:T.contentHi }}>
          {pack.price}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reach selector card ──────────────────────────────────────────────────────
function ReachCard({ label, subtitle, selected, onSelect }) {
  return (
    <motion.div
      whileTap={{ scale:0.97 }} transition={SP.pack}
      onClick={onSelect}
      animate={{ borderColor: selected ? T.contentHi : T.contentLo,
                 borderWidth: selected ? 2 : 1 }}
      style={{ flex:1, border:`${selected ? 2 : 1}px solid ${selected ? T.contentHi : T.contentLo}`,
               borderRadius:16, padding:"8px 12px", background:T.bgBase, cursor:"pointer" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi }}>{label}</div>
          <div style={{ fontFamily:FIT, fontSize:13, color:T.contentMid, marginTop:4, lineHeight:"18px" }}>{subtitle}</div>
        </div>
        <Radio selected={selected} />
      </div>
    </motion.div>
  );
}

// ─── Screen 2: Select Pack ────────────────────────────────────────────────────
function ScreenSelect({ navigate }) {
  const [reach, setReach]     = useState("city");
  const [packIdx, setPackIdx] = useState(0);
  const packs = PACKS[reach];

  const handleContinue = () => {
    const pack = packs[packIdx];
    navigate("summary", 1, { reach, pack });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:T.bgBase }}>
      <StatusBar />
      <NavBar onBack={() => navigate("manage", -1)} />

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px", scrollbarWidth:"none" }}>
        <div style={{ padding:"8px 0 14px" }}>
          <h1 style={{ fontFamily:CHUNKY, fontSize:22, fontWeight:800, color:T.contentHi, lineHeight:"30px", margin:0 }}>
            Choose a Bumps pack to add to your subscription
          </h1>
        </div>

        {/* Reach selector */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi, marginBottom:8 }}>
            Select reach
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <ReachCard label="City" subtitle="200% more views on average"
              selected={reach==="city"} onSelect={() => { setReach("city"); setPackIdx(0); }} />
            <ReachCard label="Country" subtitle="500% more views on average"
              selected={reach==="country"} onSelect={() => { setReach("country"); setPackIdx(0); }} />
          </div>
        </div>

        {/* Pack list */}
        <div style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi, marginBottom:8 }}>
          Select your pack
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AnimatePresence mode="popLayout">
            {packs.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-6 }}
                transition={{ duration:0.18, delay: i * 0.04 }}>
                <PackCard pack={p} selected={i===packIdx} onSelect={() => setPackIdx(i)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div style={{ marginTop:10, fontFamily:FIT, fontSize:13, color:T.contentMid, lineHeight:"18px" }}>
          The pack will be added to your PRO subscription and renew monthly.
        </div>
      </div>

      <BottomBar>
        <BtnPrimary onClick={handleContinue}>Continue</BtnPrimary>
      </BottomBar>
    </div>
  );
}

// ─── Screen 3: Summary ────────────────────────────────────────────────────────
function ScreenSummary({ navigate, reach, pack }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1600));
    navigate("success", 1);
  };

  if (!pack) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:T.bgBase }}>
      <StatusBar />
      <NavBar onBack={() => !confirming && navigate("select", -1)} />

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px", scrollbarWidth:"none" }}>
        <div style={{ padding:"8px 0 14px" }}>
          <h1 style={{ fontFamily:CHUNKY, fontSize:22, fontWeight:800, color:T.contentHi, lineHeight:"30px", margin:0 }}>
            Confirm subscription update
          </h1>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Order summary */}
          <Card style={{ padding:"14px 0" }}>
            <div style={{ padding:"0 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10 }}>
                <span style={{ fontFamily:FIT, fontSize:15, color:T.contentHi }}>{pack.name}</span>
                <span style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi }}>{pack.price}</span>
              </div>
            </div>
            <Divider hi />
            <div style={{ padding:"0 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0 8px" }}>
                <span style={{ fontFamily:CHUNKY, fontSize:15, fontWeight:800, color:T.contentHi }}>To pay today</span>
                <span style={{ fontFamily:CHUNKY, fontSize:22, fontWeight:800, color:T.contentHi }}>{pack.today}</span>
              </div>
              <p style={{ fontFamily:FIT, fontSize:13, color:T.contentMid, lineHeight:"18px", paddingBottom:6, margin:0 }}>
                You'll get <strong style={{ fontFamily:CHUNKY }}>{pack.bumps} bumps</strong> now for a price adjusted to the days left in your cycle.
              </p>
            </div>
          </Card>

          {/* What happens next */}
          <InfoBox title="What happens next?">
            <ul style={{ paddingLeft:16, margin:0 }}>
              <li style={{ fontFamily:FIT, fontSize:13, color:T.contentHi, lineHeight:"18px", marginBottom:4 }}>
                Your Wallapop PRO Cars plan updates to <strong style={{ fontFamily:CHUNKY }}>{pack.newPlan}</strong> starting today.
              </li>
              <li style={{ fontFamily:FIT, fontSize:13, color:T.contentHi, lineHeight:"18px", marginBottom:4 }}>
                Your <strong style={{ fontFamily:CHUNKY }}>{pack.bumps} {reach === "city" ? "City" : "Country"} Bumps</strong> will be renewed every month, but won't accumulate.
              </li>
              <li style={{ fontFamily:FIT, fontSize:13, color:T.contentHi, lineHeight:"18px" }}>
                You can modify or cancel at any time.
              </li>
            </ul>
          </InfoBox>

          {/* Payment method */}
          <div>
            <div style={{ fontFamily:CHUNKY, fontSize:13, fontWeight:800, color:T.contentHi, marginBottom:8 }}>
              Subscription payment method
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <VisaLogo />
              <span style={{ fontFamily:FIT, fontSize:15, color:T.contentHi }}>Visa *** 1234</span>
              <motion.span whileTap={{ opacity:0.6 }}
                style={{ fontFamily:CHUNKY, fontSize:13, fontWeight:800, color:T.contentHi,
                         textDecoration:"underline", marginLeft:"auto", cursor:"pointer" }}>
                Change
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BtnBrand onClick={handleConfirm} loading={confirming}>
          Confirm
        </BtnBrand>
      </BottomBar>
    </div>
  );
}

// ─── Screen 4: Success ────────────────────────────────────────────────────────
function ScreenSuccess({ navigate, pack }) {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:T.bgBase, position:"relative" }}>
      <StatusBar />
      <div style={{ height:48, display:"flex", alignItems:"center", padding:"0 4px", flexShrink:0 }}>
        <motion.button whileTap={{ scale:0.88 }} transition={SP.btn}
          onClick={() => navigate("manage", -1)}
          style={{ width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center",
                   border:"none", background:"transparent", cursor:"pointer", borderRadius:100 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.contentHi} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </motion.button>
      </div>

      {/* Confetti origin centered on check circle */}
      <ConfettiBurst originX={197 - 12} originY={320 - 12} active={burst} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
                    alignItems:"center", gap:28, padding:"0 16px" }}>
        <CheckCircle visible />
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.45, duration:0.4, ease:[0.22, 1, 0.36, 1] }}
          style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:10 }}>
          <h2 style={{ fontFamily:CHUNKY, fontSize:22, fontWeight:800, color:"#253238",
                       lineHeight:"30px", maxWidth:300, margin:0 }}>
            The Bumps pack has been added to your plan
          </h2>
          <p style={{ fontFamily:FIT, fontSize:15, color:"#607D8B", lineHeight:"22px", margin:0 }}>
            You can already start bumping your listings
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.55, duration:0.4, ease:[0.22, 1, 0.36, 1] }}
        style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <BtnSecondary onClick={() => navigate("manage", -1)}>See subscription</BtnSecondary>
        <BtnPrimary onClick={() => navigate("manage", -1)}>Go to catalog</BtnPrimary>
      </motion.div>

      <HomeIndicator />
    </div>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ current }) {
  return (
    <div style={{ display:"flex", gap:6, justifyContent:"center", padding:"8px 0 4px" }}>
      {SCREENS.map((s, i) => (
        <motion.div key={s}
          animate={{ width: s === current ? 18 : 6, background: s === current ? T.bgHigh : T.bgMid }}
          transition={{ type:"spring", stiffness:400, damping:30 }}
          style={{ height:6, borderRadius:3 }} />
      ))}
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("manage");
  const [direction, setDir]     = useState(1);
  const [payload, setPayload]   = useState({});

  const navigate = useCallback((to, dir, data = {}) => {
    setDir(dir);
    setPayload(data);
    setScreen(to);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "manage":  return <ScreenManage navigate={navigate} />;
      case "select":  return <ScreenSelect navigate={navigate} />;
      case "summary": return <ScreenSummary navigate={navigate} reach={payload.reach} pack={payload.pack} />;
      case "success": return <ScreenSuccess navigate={navigate} pack={payload.pack} />;
      default:        return null;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  padding:"1rem 0", gap:12, fontFamily:FIT }}>
      {/* Nunito font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');`}</style>

      <ProgressDots current={screen} />

      {/* Phone shell */}
      <div style={{ width:393, height:720, background:T.bgBase, borderRadius:44,
                    overflow:"hidden", position:"relative",
                    border:"2px solid #E0E0E0",
                    boxShadow:"0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)" }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div key={screen} custom={direction}
            variants={{
              enter:  d => ({ x: d > 0 ? 393 : -393 }),
              center: { x: 0 },
              exit:   d => ({ x: d > 0 ? -120 : 120 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={SP.nav}
            style={{ position:"absolute", inset:0, willChange:"transform" }}>
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      <p style={{ fontSize:12, color:"#888", textAlign:"center" }}>
        Tap <strong>See more</strong> on the banner to start
      </p>
    </div>
  );
}
