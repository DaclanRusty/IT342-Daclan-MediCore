import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:26,height:26}}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: 'For Patients',
    color: '#2563eb',
    bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
    border: '#bfdbfe',
    desc: 'Book appointments online with your preferred doctors at your convenience, anytime.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:26,height:26}}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: 'For Secretaries',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
    border: '#ddd6fe',
    desc: 'Manage and confirm appointment requests efficiently in one central system.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:26,height:26}}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    label: 'For Doctors',
    color: '#059669',
    bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    border: '#bbf7d0',
    desc: 'View your confirmed schedule and patient appointments in real-time.',
  },
];

function Cloud({ style }) {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M170 60H45C28 60 15 47 15 30C15 15 26 4 40 4C42 4 44 4 46 5C50 -1 58 -2 65 2C70 -4 80 -5 88 1C93 -3 101 -3 107 2C114 -2 124 0 128 8C140 6 152 14 154 26C162 26 170 34 170 43V60Z" fill="white" fillOpacity="0.65"/>
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#f0f4ff', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatA{0%,100%{transform:translateY(0px) translateX(0px)}33%{transform:translateY(-14px) translateX(6px)}66%{transform:translateY(-6px) translateX(-4px)}}
        @keyframes floatB{0%,100%{transform:translateY(0px)}50%{transform:translateY(-16px)}}
        @keyframes floatC{0%,100%{transform:translateY(-8px)}50%{transform:translateY(8px)}}
        @keyframes cloudDrift{from{transform:translateX(-12px)}to{transform:translateX(12px)}}
        @keyframes cloudDriftR{from{transform:translateX(12px)}to{transform:translateX(-12px)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.1);opacity:1}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes rotateSlow{to{transform:rotate(360deg)}}
        .d1{animation:fadeUp 0.8s cubic-bezier(.22,1,.36,1) .05s forwards;opacity:0;}
        .d2{animation:fadeUp 0.8s cubic-bezier(.22,1,.36,1) .18s forwards;opacity:0;}
        .d3{animation:fadeUp 0.8s cubic-bezier(.22,1,.36,1) .32s forwards;opacity:0;}
        .d4{animation:fadeUp 0.8s cubic-bezier(.22,1,.36,1) .48s forwards;opacity:0;}
        .d5{animation:fadeUp 0.8s cubic-bezier(.22,1,.36,1) .62s forwards;opacity:0;}
        .cloud-a{animation:cloudDrift 9s ease-in-out infinite alternate;}
        .cloud-b{animation:cloudDriftR 12s ease-in-out infinite alternate;}
        .cloud-c{animation:cloudDrift 15s ease-in-out infinite alternate;}
        .float-card{animation:floatB 6s ease-in-out infinite;}
        .float-orb{animation:floatA 9s ease-in-out infinite;}
        .float-slow{animation:floatC 12s ease-in-out infinite;}
        .feature-card{transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s;background:#fff;border-radius:24px;box-shadow:0 2px 16px rgba(15,23,42,.06);}
        .feature-card:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 24px 56px rgba(37,99,235,.14);}
        .btn-p{transition:all .25s cubic-bezier(.22,1,.36,1);cursor:pointer;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;font-weight:700;position:relative;overflow:hidden;}
        .btn-p:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(37,99,235,.45);}
        .btn-s{transition:all .25s;cursor:pointer;background:#fff;border:1.5px solid #cbd5e1;color:#334155;font-weight:600;}
        .btn-s:hover{background:#f8fafc;border-color:#94a3b8;transform:translateY(-2px);}
        .shimmer-text{background:linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
        .ring{position:absolute;border-radius:50%;border:1.5px solid rgba(37,99,235,.1);animation:rotateSlow 30s linear infinite;}
        .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(37,99,235,.1);border-radius:100px;padding:5px 14px;color:#2563eb;font-size:13px;font-weight:600;border:1px solid rgba(37,99,235,.15);}
        .dot{width:7px;height:7px;background:#2563eb;border-radius:50%;animation:pulse 2s ease-in-out infinite;}
        .blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;}
        .nav-link{font-size:14px;font-weight:500;color:#475569;cursor:pointer;padding:6px 4px;transition:color .2s;}
        .nav-link:hover{color:#2563eb;}
        .scroll-hint{animation:floatC 2.5s ease-in-out infinite;cursor:pointer;}
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,.06),0 4px 24px rgba(37,99,235,.06)' : 'none',
        transition:'all .35s',padding:'0 6%',
        display:'flex',alignItems:'center',justifyContent:'space-between',height:66,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <div style={{width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:17,boxShadow:'0 4px 12px rgba(37,99,235,.35)'}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:'#0f172a',letterSpacing:'-0.3px'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          <span className="nav-link" onClick={()=>document.getElementById('about').scrollIntoView({behavior:'smooth'})}>About</span>
          <span className="nav-link" onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})}>Features</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button className="btn-s" onClick={()=>navigate('/login')} style={{padding:'8px 20px',borderRadius:9,fontSize:14}}>Login</button>
          <button className="btn-p" onClick={()=>navigate('/register')} style={{padding:'9px 22px',borderRadius:9,fontSize:14}}>Register</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'100px 6% 80px',background:'linear-gradient(160deg,#eef2ff 0%,#e0e7ff 40%,#dbeafe 70%,#ede9fe 100%)',position:'relative',overflow:'hidden'}}>

        {/* Background blobs */}
        <div className="blob" style={{width:600,height:600,background:'rgba(37,99,235,.12)',top:-200,right:-100}}/>
        <div className="blob" style={{width:400,height:400,background:'rgba(124,58,237,.08)',bottom:-100,left:-80}}/>
        <div className="blob" style={{width:300,height:300,background:'rgba(16,185,129,.07)',bottom:80,right:'20%'}}/>

        {/* Rings */}
        <div className="ring" style={{width:500,height:500,top:'50%',right:'5%',marginTop:-250}}/>
        <div className="ring" style={{width:340,height:340,top:'50%',right:'calc(5% + 80px)',marginTop:-170,animationDirection:'reverse',animationDuration:'20s'}}/>

        {/* Clouds */}
        <div className="cloud-a" style={{position:'absolute',top:80,left:'8%',opacity:.7}}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-b" style={{position:'absolute',top:140,right:'32%',opacity:.5}}><Cloud style={{width:160,height:64}}/></div>
        <div className="cloud-c" style={{position:'absolute',top:60,right:'8%',opacity:.4}}><Cloud style={{width:180,height:72}}/></div>
        <div className="cloud-a" style={{position:'absolute',bottom:120,left:'20%',opacity:.3}}><Cloud style={{width:200,height:80}}/></div>

        {/* Orbs */}
        <div className="float-orb" style={{position:'absolute',width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,rgba(37,99,235,.25),rgba(124,58,237,.2))',top:'20%',right:'15%',border:'1px solid rgba(255,255,255,.5)'}}/>
        <div className="float-slow" style={{position:'absolute',width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,rgba(16,185,129,.3),rgba(37,99,235,.15))',top:'65%',right:'28%',border:'1px solid rgba(255,255,255,.4)'}}/>
        <div className="float-orb" style={{position:'absolute',width:32,height:32,borderRadius:'50%',background:'rgba(124,58,237,.2)',top:'35%',left:'5%',border:'1px solid rgba(255,255,255,.4)',animationDelay:'3s'}}/>

        <div style={{maxWidth:1200,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60,flexWrap:'wrap',position:'relative',zIndex:2}}>

          {/* Left */}
          <div style={{flex:'1 1 420px',maxWidth:580}}>
            <div className="d1"><span className="badge"><span className="dot"/>Healthcare Scheduling Made Easy</span></div>
            <h1 className="d2" style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(2.4rem,5.5vw,3.8rem)',fontWeight:900,lineHeight:1.1,color:'#0f172a',marginTop:20,marginBottom:20,letterSpacing:'-1px'}}>
              Easy &amp; Reliable<br/><span className="shimmer-text">Healthcare</span><br/>Appointments
            </h1>
            <p className="d3" style={{fontSize:16.5,color:'#475569',lineHeight:1.75,maxWidth:460,marginBottom:36}}>
              MediCore streamlines appointments for patients, secretaries, and doctors. Book online, manage schedules, and access your healthcare from anywhere.
            </p>
            <div className="d4" style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:40}}>
              <button className="btn-p" onClick={()=>navigate('/register')} style={{padding:'14px 32px',borderRadius:11,fontSize:15}}>Register</button>
              <button className="btn-s" onClick={()=>document.getElementById('about').scrollIntoView({behavior:'smooth'})} style={{padding:'14px 28px',borderRadius:11,fontSize:15}}>Learn More</button>
            </div>
          </div>

          {/* Right card */}
          <div className="d4" style={{flex:'1 1 340px',display:'flex',justifyContent:'center',position:'relative'}}>
            <div style={{position:'absolute',width:'85%',height:'85%',background:'radial-gradient(circle,rgba(37,99,235,.2) 0%,transparent 70%)',filter:'blur(30px)',zIndex:0}}/>

            <div className="float-card" style={{background:'#fff',borderRadius:28,overflow:'hidden',boxShadow:'0 40px 100px rgba(37,99,235,.2),0 8px 32px rgba(0,0,0,.06)',maxWidth:400,width:'100%',position:'relative',zIndex:1}}>
              {/* Card header */}
              <div style={{background:'linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)',padding:'24px 28px 20px',color:'#fff',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',bottom:-10,right:-20,opacity:.12}}><Cloud style={{width:200,height:80}}/></div>
                <div style={{display:'flex',alignItems:'center',gap:10,position:'relative'}}>
                  <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.25)'}}>🩺</div>
                  <div>
                    <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700}}>MediCore</div>
                    <div style={{fontSize:12,opacity:.75}}>Patient Management System</div>
                  </div>
                </div>
                <div style={{marginTop:16,fontSize:13,opacity:.85,lineHeight:1.6,position:'relative'}}>
                  A platform connecting <strong>patients</strong>, <strong>doctors</strong>, and <strong>secretaries</strong> for seamless healthcare scheduling.
                </div>
              </div>

              {/* Role cards */}
              <div style={{padding:'20px 24px 24px'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'1.5px',color:'#94a3b8',textTransform:'uppercase',marginBottom:14}}>Who is it for?</div>
                {[
                  {icon:'👤', color:'#2563eb', bg:'#eff6ff', role:'Patient', desc:'Book & track appointments'},
                  {icon:'👨‍⚕️', color:'#059669', bg:'#f0fdf4', role:'Doctor',  desc:'Manage your schedule & patients'},
                  {icon:'📋', color:'#7c3aed', bg:'#f5f3ff', role:'Secretary', desc:'Handle requests & confirmations'},
                ].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'11px 0',borderBottom:i<2?'1px solid #f1f5f9':'none'}}>
                    <div style={{width:40,height:40,borderRadius:12,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{item.icon}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:1}}>{item.role}</div>
                      <div style={{fontSize:12,color:'#94a3b8'}}>{item.desc}</div>
                    </div>
                    <div style={{marginLeft:'auto',fontSize:11,fontWeight:600,color:item.color,background:item.bg,padding:'3px 10px',borderRadius:20,whiteSpace:'nowrap'}}>
                      Register →
                    </div>
                  </div>
                ))}
                <button className="btn-p" onClick={()=>navigate('/register')} style={{width:'100%',marginTop:18,padding:'13px 0',borderRadius:12,fontSize:14}}>
                  Create Your Account →
                </button>
              </div>
            </div>

            {/* Floating mini cards */}
            <div className="float-slow" style={{position:'absolute',top:-16,left:-20,background:'#fff',borderRadius:14,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,.1)',display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:'#0f172a',zIndex:2,whiteSpace:'nowrap'}}>
              <div style={{width:28,height:28,borderRadius:8,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🔒</div>
              Google Verified Accounts
            </div>
            <div className="float-orb" style={{position:'absolute',bottom:20,left:-30,background:'#fff',borderRadius:14,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,.1)',display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:'#0f172a',zIndex:2,whiteSpace:'nowrap',animationDelay:'2s',width:'auto',height:'auto'}}>
              <div style={{width:28,height:28,borderRadius:8,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>📅</div>
              Easy Appointment Booking
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint" onClick={()=>document.getElementById('about').scrollIntoView({behavior:'smooth'})} style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,color:'#94a3b8',fontSize:12,fontWeight:500}}>
          <span>Scroll to explore</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" style={{padding:'100px 6%',background:'linear-gradient(180deg,#fff 0%,#f8faff 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:20,right:'5%',opacity:.1}}><Cloud style={{width:280,height:110}}/></div>
        <div style={{position:'absolute',bottom:40,left:'2%',opacity:.08}}><Cloud style={{width:240,height:96}}/></div>

        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <span className="badge" style={{marginBottom:16,display:'inline-flex'}}>About MediCore</span>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.9rem,4vw,2.8rem)',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginTop:16}}>
              What is <span style={{color:'#2563eb'}}>MediCore?</span>
            </h2>
            <p style={{color:'#64748b',fontSize:16,maxWidth:560,margin:'18px auto 0',lineHeight:1.75}}>
              MediCore is a comprehensive Patient Management System that connects patients and doctors through a seamless digital platform.
            </p>
          </div>

          {/* Feature cards */}
          <div id="features" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}>
            {FEATURES.map((f,i)=>(
              <div key={f.label} className="feature-card" style={{padding:'36px 32px',border:`1.5px solid ${f.border}`}}>
                <div style={{width:60,height:60,borderRadius:18,background:f.bg,color:f.color,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:22,border:`1px solid ${f.border}`,boxShadow:`0 4px 16px ${f.border}80`}}>{f.icon}</div>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800,color:'#0f172a',marginBottom:12,letterSpacing:'-0.3px'}}>{f.label}</h3>
                <p style={{color:'#64748b',fontSize:14.5,lineHeight:1.7,marginBottom:24}}>{f.desc}</p>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,color:f.color,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>navigate('/register')}>
                  Register <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {/* How it works banner */}
          <div style={{marginTop:80,background:'linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb)',borderRadius:28,padding:'52px 48px',color:'#fff',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-20,right:60,opacity:.07}}><Cloud style={{width:320,height:128}}/></div>
            <div style={{position:'absolute',bottom:-30,left:40,opacity:.05}}><Cloud style={{width:260,height:104}}/></div>
            <div style={{textAlign:'center',marginBottom:48,position:'relative'}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:800,marginBottom:12}}>How it works</h3>
              <p style={{opacity:.75,fontSize:15,maxWidth:480,margin:'0 auto'}}>Get started in three simple steps</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:32,position:'relative'}}>
              {[
                {step:'01',title:'Create Account',desc:'Register with your Google email in under 2 minutes',icon:'👤'},
                {step:'02',title:'Set Up Profile',desc:'Complete your profile and preferences for your role',icon:'⚙️'},
                {step:'03',title:'Start Using',desc:'Book appointments, manage schedules, access records',icon:'🚀'},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{width:56,height:56,borderRadius:18,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 16px',border:'1px solid rgba(255,255,255,.2)',backdropFilter:'blur(8px)'}}>{s.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:'2px',opacity:.5,marginBottom:8,textTransform:'uppercase'}}>Step {s.step}</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:700,marginBottom:8}}>{s.title}</div>
                  <div style={{fontSize:13.5,opacity:.7,lineHeight:1.65}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{padding:'100px 6%',background:'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 50%,#dbeafe 100%)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div className="cloud-b" style={{position:'absolute',top:20,left:'10%',opacity:.5}}><Cloud style={{width:200,height:80}}/></div>
        <div className="cloud-a" style={{position:'absolute',top:40,right:'8%',opacity:.45}}><Cloud style={{width:220,height:88}}/></div>
        <div className="cloud-c" style={{position:'absolute',bottom:30,left:'30%',opacity:.35}}><Cloud style={{width:180,height:72}}/></div>

        <div style={{maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
          <span className="badge" style={{marginBottom:20,display:'inline-flex'}}>Ready to get started?</span>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:900,color:'#0f172a',marginTop:16,marginBottom:16,letterSpacing:'-0.5px',lineHeight:1.15}}>
            Join MediCore<br/><span className="shimmer-text">Today for Free</span>
          </h2>
          <p style={{color:'#64748b',fontSize:16,maxWidth:460,margin:'0 auto 40px',lineHeight:1.7}}>
            Register as a patient, doctor, or secretary and experience seamless healthcare scheduling.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-p" onClick={()=>navigate('/register')} style={{padding:'15px 36px',borderRadius:12,fontSize:15}}>Register Now</button>
            <button className="btn-s" onClick={()=>navigate('/login')} style={{padding:'15px 28px',borderRadius:12,fontSize:15}}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{background:'#0f172a',color:'#64748b',padding:'32px 6%'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14}}>M</div>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,color:'#fff',fontSize:15}}>Medi<span style={{color:'#3b82f6'}}>Core</span></span>
          </div>
          <div style={{fontSize:13}}>Making Healthcare Scheduling Easier · © {new Date().getFullYear()} MediCore</div>
          <div style={{display:'flex',gap:20,fontSize:13}}>
            {['Privacy','Terms','Contact'].map(l=>(
              <span key={l} style={{cursor:'pointer',transition:'color .2s'}}
                onMouseEnter={e=>e.target.style.color='#fff'}
                onMouseLeave={e=>e.target.style.color='#64748b'}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
