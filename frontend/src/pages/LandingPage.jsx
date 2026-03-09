import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:24,height:24}}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: 'Patients',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.10)',
    desc: 'Book appointments online with your preferred doctors at your convenience.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:24,height:24}}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: 'Secretaries',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.10)',
    desc: 'Manage and confirm appointment requests efficiently in one central system.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:24,height:24}}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    label: 'Doctors',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
    desc: 'View your confirmed schedule and patient appointments in real-time.',
  },
];

const STATS = [
  { value: '10K+', label: 'Patients Served' },
  { value: '500+', label: 'Doctors' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Available' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#f0f4ff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .hero-animate{animation:fadeUp 0.7s ease forwards;}
        .d1{animation-delay:.1s;opacity:0}.d2{animation-delay:.25s;opacity:0}.d3{animation-delay:.4s;opacity:0}.d4{animation-delay:.55s;opacity:0}
        .float-card{animation:float 5s ease-in-out infinite;}
        .feature-card{transition:transform .25s,box-shadow .25s;background:#fff;border-radius:20px;padding:32px 28px;box-shadow:0 4px 24px rgba(15,23,42,.06);border:1px solid rgba(226,232,240,.8);}
        .feature-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(37,99,235,.13);}
        .btn-p{transition:all .2s;cursor:pointer;}.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,.35);}
        .btn-s{transition:all .2s;cursor:pointer;}.btn-s:hover{background:rgba(37,99,235,.08)!important;}
        .stat{transition:transform .2s;}.stat:hover{transform:scale(1.05);}
      `}</style>

      {/* Navbar */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 24px rgba(37,99,235,.08)' : 'none',
        transition:'all .3s',padding:'0 5%',
        display:'flex',alignItems:'center',justifyContent:'space-between',height:64,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16}}>M</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:'#1e293b'}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button className="btn-s" onClick={()=>navigate('/login')} style={{padding:'8px 20px',borderRadius:8,border:'1.5px solid #cbd5e1',background:'transparent',color:'#334155',fontWeight:500,fontSize:14}}>Login</button>
          <button className="btn-p" onClick={()=>navigate('/register/patient')} style={{padding:'8px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',fontWeight:600,fontSize:14}}>Register</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'100px 5% 60px',background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 50%,#dbeafe 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-80,right:-80,width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:0,left:-60,width:360,height:360,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div style={{maxWidth:1200,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60,flexWrap:'wrap'}}>
          {/* Left */}
          <div style={{flex:'1 1 400px'}}>
            <div className="hero-animate d1" style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(37,99,235,.1)',borderRadius:20,padding:'5px 14px',color:'#2563eb',fontSize:13,fontWeight:600,marginBottom:20}}>
              <span style={{width:7,height:7,background:'#2563eb',borderRadius:'50%'}} />
              24/7 Available — Book Anytime
            </div>
            <h1 className="hero-animate d2" style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(2.2rem,5vw,3.4rem)',fontWeight:800,lineHeight:1.15,color:'#0f172a',marginBottom:20}}>
              Easy & Reliable<br/><span style={{color:'#2563eb'}}>Healthcare</span><br/>Appointments
            </h1>
            <p className="hero-animate d2" style={{fontSize:16,color:'#64748b',lineHeight:1.7,maxWidth:440,marginBottom:36}}>
              MediCore streamlines the appointment process for patients, secretaries, and doctors. Book appointments online, manage schedules efficiently, and access your healthcare from anywhere.
            </p>
            <div className="hero-animate d3" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button className="btn-p" onClick={()=>navigate('/register/patient')} style={{padding:'13px 28px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',fontWeight:600,fontSize:15}}>Register</button>
              <button className="btn-s" onClick={()=>document.getElementById('about').scrollIntoView({behavior:'smooth'})} style={{padding:'13px 28px',borderRadius:10,border:'1.5px solid #cbd5e1',background:'#fff',color:'#334155',fontWeight:600,fontSize:15}}>Learn More</button>
            </div>
          </div>

          {/* Right card */}
          <div className="hero-animate d4 float-card" style={{flex:'1 1 340px',display:'flex',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:24,overflow:'hidden',boxShadow:'0 32px 80px rgba(37,99,235,.16)',maxWidth:420,width:'100%'}}>
              <div style={{background:'linear-gradient(135deg,#2563eb,#1d4ed8)',padding:'28px 28px 20px',color:'#fff'}}>
                <div style={{fontSize:13,opacity:.85,marginBottom:6}}>Virtual Consultation</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700}}>Dr. Mesha Lao</div>
                <div style={{fontSize:13,opacity:.75,marginTop:4}}>General Medicine • Available Now</div>
              </div>
              <div style={{padding:24}}>
                {[{icon:'🩺',text:'Book in under 2 minutes'},{icon:'📋',text:'Digital prescriptions & records'},{icon:'🔔',text:'Reminders & real-time updates'}].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<2?'1px solid #f1f5f9':'none'}}>
                    <span style={{fontSize:20}}>{item.icon}</span>
                    <span style={{color:'#334155',fontSize:14,fontWeight:500}}>{item.text}</span>
                  </div>
                ))}
                <button className="btn-p" onClick={()=>navigate('/login')} style={{width:'100%',marginTop:18,padding:12,borderRadius:10,border:'none',background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'#fff',fontWeight:600,fontSize:14}}>Book an Appointment →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{background:'#fff',padding:'40px 5%'}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:24}}>
          {STATS.map(s=>(
            <div key={s.label} className="stat" style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:800,color:'#2563eb'}}>{s.value}</div>
              <div style={{fontSize:13,color:'#94a3b8',fontWeight:500,marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{padding:'80px 5%',background:'linear-gradient(180deg,#fff 0%,#f0f4ff 100%)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-block',background:'rgba(37,99,235,.08)',borderRadius:20,padding:'5px 16px',color:'#2563eb',fontSize:13,fontWeight:600,marginBottom:16}}>About MediCore</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:800,color:'#0f172a'}}>
              What is <span style={{color:'#2563eb'}}>MediCore?</span>
            </h2>
            <p style={{color:'#64748b',fontSize:16,maxWidth:540,margin:'16px auto 0',lineHeight:1.7}}>
              MediCore is a comprehensive Patient Management System that connects patients, healthcare staff, and doctors through a seamless digital platform. Accessible on both web and mobile devices.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            {FEATURES.map(f=>(
              <div key={f.label} className="feature-card">
                <div style={{width:52,height:52,borderRadius:14,background:f.bg,color:f.color,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>{f.icon}</div>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:'#0f172a',marginBottom:10}}>{f.label}</h3>
                <p style={{color:'#64748b',fontSize:14,lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 5%',background:'linear-gradient(135deg,#1e40af,#2563eb)',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:800,marginBottom:16}}>Ready to get started?</h2>
        <p style={{fontSize:16,opacity:.85,maxWidth:480,margin:'0 auto 36px',lineHeight:1.7}}>Join thousands of patients, doctors, and clinics already using MediCore.</p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn-p" onClick={()=>navigate('/register/patient')} style={{padding:'13px 32px',borderRadius:10,border:'2px solid rgba(255,255,255,.4)',background:'#fff',color:'#2563eb',fontWeight:700,fontSize:15}}>Register as Patient</button>
          <button onClick={()=>navigate('/register/doctor')} style={{padding:'13px 32px',borderRadius:10,border:'2px solid rgba(255,255,255,.5)',background:'transparent',color:'#fff',fontWeight:600,fontSize:15,cursor:'pointer',transition:'all .2s'}}>Join as Doctor</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#0f172a',color:'#94a3b8',padding:'28px 5%',textAlign:'center',fontSize:14}}>
        <span style={{fontFamily:"'Sora',sans-serif",color:'#fff',fontWeight:600}}>Medi<span style={{color:'#2563eb'}}>Core</span></span>
        {' '}— Making Healthcare Scheduling Easier · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}