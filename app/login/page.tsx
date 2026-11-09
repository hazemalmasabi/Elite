"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { demoProfiles, DEMO_SESSION_KEY, getDemoProfile } from "@/auth/demo-session";
import { academyRepository, platformRepository } from "@/data/repository-provider";
import type { AttendanceMark, DemoAcademyData, DemoBranch, DemoPlatformAcademy, DemoPlatformData, DemoPlayer, DemoProfile, DemoRole, DemoSession, DemoStaff, DemoTeam, NewDemoPlayer } from "@/data/models";

type NavKey = "overview" | "branches" | "players" | "teams" | "coaches" | "schedule" | "attendance" | "assessments" | "development" | "reports" | "settings" | "academies" | "users" | "activity" | "progress" | "achievements";

const roleInfo: Record<DemoRole, { title: string; subtitle: string; icon: string; color: string }> = {
  platform_admin: { title: "إدارة المنصة", subtitle: "إدارة الأكاديميات والمستخدمين", icon: "◈", color: "purple" },
  owner: { title: "مالك الأكاديمية", subtitle: "إدارة جميع الفروع وميزات المدير", icon: "◆", color: "green" },
  manager: { title: "مدير الأكاديمية", subtitle: "إدارة أكاديميتك فقط", icon: "▦", color: "orange" },
  coach: { title: "المدرب", subtitle: "فريقي، الحضور، والتطوير", icon: "⚽", color: "blue" },
  parent: { title: "ولي الأمر", subtitle: "متابعة الأبناء والتقارير", icon: "♡", color: "yellow" },
  player: { title: "اللاعب", subtitle: "رحلتك وأهدافك الرياضية", icon: "↗", color: "pink" },
};

const navByRole: Record<DemoRole, { label: string; key: NavKey; icon: string }[]> = {
  platform_admin: [
    { label: "نظرة عامة", key: "overview", icon: "grid" }, { label: "الأكاديميات", key: "academies", icon: "academy" },
    { label: "المستخدمون", key: "users", icon: "users" }, { label: "سجل النشاط", key: "activity", icon: "activity" }, { label: "الإعدادات", key: "settings", icon: "settings" },
  ],
  owner: [
    { label: "نظرة عامة", key: "overview", icon: "grid" }, { label: "الفروع", key: "branches", icon: "academy" },
    { label: "اللاعبون", key: "players", icon: "users" }, { label: "الفرق والفئات", key: "teams", icon: "teams" },
    { label: "المدربون والموظفون", key: "coaches", icon: "coach" }, { label: "الجدول", key: "schedule", icon: "calendar" },
    { label: "الحضور", key: "attendance", icon: "check" }, { label: "التقييمات", key: "assessments", icon: "chart" },
    { label: "خطط التطوير", key: "development", icon: "target" }, { label: "التقارير", key: "reports", icon: "report" },
    { label: "الإعدادات", key: "settings", icon: "settings" },
  ],
  manager: [
    { label: "نظرة عامة", key: "overview", icon: "grid" }, { label: "اللاعبون", key: "players", icon: "users" },
    { label: "الفرق والفئات", key: "teams", icon: "teams" }, { label: "المدربون والموظفون", key: "coaches", icon: "coach" },
    { label: "الجدول", key: "schedule", icon: "calendar" }, { label: "الحضور", key: "attendance", icon: "check" },
    { label: "التقييمات", key: "assessments", icon: "chart" }, { label: "خطط التطوير", key: "development", icon: "target" },
    { label: "التقارير", key: "reports", icon: "report" }, { label: "الإعدادات", key: "settings", icon: "settings" },
  ],
  coach: [
    { label: "نظرة عامة", key: "overview", icon: "grid" }, { label: "فريقي", key: "teams", icon: "teams" },
    { label: "الحضور", key: "attendance", icon: "check" }, { label: "ملفات اللاعبين", key: "players", icon: "users" },
    { label: "التقييمات", key: "assessments", icon: "chart" }, { label: "خطط التطوير", key: "development", icon: "target" }, { label: "الجدول", key: "schedule", icon: "calendar" },
  ],
  parent: [
    { label: "الرئيسية", key: "overview", icon: "grid" }, { label: "جدول الأبناء", key: "schedule", icon: "calendar" },
    { label: "الحضور", key: "attendance", icon: "check" }, { label: "التقارير والتقييمات", key: "reports", icon: "report" }, { label: "أهداف التطوير", key: "development", icon: "target" },
  ],
  player: [
    { label: "ملفي الرياضي", key: "overview", icon: "grid" }, { label: "جدولي", key: "schedule", icon: "calendar" },
    { label: "تقدمي", key: "progress", icon: "chart" }, { label: "أهدافي", key: "development", icon: "target" }, { label: "إنجازاتي", key: "achievements", icon: "award" },
  ],
};

const roleOptions: DemoRole[] = ["owner", "manager", "coach", "parent", "player", "platform_admin"];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></>,
    users: <><path d="M16 20v-1.4a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="3.5"/><path d="M21 20v-1.4a4 4 0 0 0-3-3.87M16 3.3a3.5 3.5 0 0 1 0 6.8"/></>,
    teams: <><path d="M12 3 3.8 7.5v9L12 21l8.2-4.5v-9L12 3Z"/><path d="m3.8 7.5 8.2 4.6 8.2-4.6M12 12.1V21"/></>,
    coach: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M19 5l1.4 1.4L23 4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><circle cx="20" cy="6" r="1"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    report: <><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.8Z" transform="translate(-1 -1) scale(1.08)"/></>,
    check: <><path d="M20 11.2V12a8 8 0 1 1-4.7-7.3"/><path d="m8.5 11.5 3 3L21 5"/></>,
    academy: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 11v5c3.5 3 8.5 3 12 0v-5M21 9v6"/></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    award: <><circle cx="12" cy="8" r="6"/><path d="m8.2 13-1 8 4.8-2.5 4.8 2.5-1-8"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };
  return <svg {...common} aria-hidden="true">{paths[name] ?? paths.grid}</svg>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "brand-compact" : ""}`}><span className="brand-mark"><span>ن</span></span>{!compact && <span className="brand-copy"><strong>نخبة</strong><small>منصة الأكاديمية</small></span>}</div>;
}

function Avatar({ initials, color = "mint", small = false }: { initials: string; color?: string; small?: boolean }) {
  return <span className={`avatar avatar-${color} ${small ? "avatar-small" : ""}`}>{initials}</span>;
}

function LoginScreen({ onLogin }: { onLogin: (role: DemoRole) => void }) {
  return (
    <main className="login-page">
      <section className="login-aside">
        <div className="login-aside-content">
          <Brand />
          <div className="login-hero-copy">
            <span className="eyebrow light-eyebrow"><span className="pulse-dot" /> منصة واحدة، رحلة أوضح</span>
            <h1>كل خطوة في<br /><em>مسيرة اللاعب</em><br />تصنع فرقاً.</h1>
            <p>من أول تدريب إلى كل إنجاز؛ مساحة تجمع الأكاديمية والمدرب واللاعب وولي الأمر.</p>
          </div>
          <div className="pitch-art" aria-hidden="true">
            <div className="pitch-lines"><span/><span/><span/><i/><b/></div>
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="floating-ball">⚽</span>
          </div>
          <div className="login-aside-footer"><span>●</span> متابعة مستمرة <span>●</span> نمو قابل للقياس <span>●</span> تواصل أسهل</div>
        </div>
      </section>
      <section className="login-main">
        <div className="login-mobile-brand"><Brand /></div>
        <div className="login-form-wrap">
          <div className="login-heading">
            <div className="login-top-bar">
              <span className="eyebrow"><span className="pulse-dot" /> مرحباً بك في نخبة</span>
              <Link className="login-back-btn" href="/" title="العودة للصفحة الرئيسية">
                <span className="login-back-btn-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </span>
                <span>العودة للصفحة الرئيسية</span>
                <span className="login-back-arrow" aria-hidden="true">←</span>
              </Link>
            </div>
            <h2>اختر طريقة الدخول</h2>
            <p>نموذج تجريبي — اختر دوراً لاستعراض الواجهة والصفحات المناسبة له.</p>
          </div>
          <div className="demo-note"><span className="demo-note-icon">✦</span><span><strong>دخول تجريبي مباشر</strong><small>لا تحتاج إلى كلمة مرور. اختر دور المستخدم.</small></span><span className="demo-tag">DEMO</span></div>
          <div className="role-grid">
            {roleOptions.map((role) => {
              const profile = getDemoProfile(role)!;
              const info = roleInfo[role];
              return <button className={`role-card role-card-${role}`} key={role} onClick={() => onLogin(role)}>
                <span className={`role-icon role-${info.color}`}>{info.icon}</span>
                <span className="role-card-copy"><strong>{info.title}</strong><small>{info.subtitle}</small><small className="role-person">{profile.name}</small></span>
                <span className="role-arrow"><Icon name="arrow" size={16}/></span>
              </button>;
            })}
          </div>
          <div className="login-bottom"><span className="lock-dot">✓</span> واجهة استعراضية ببيانات افتراضية فقط</div>
        </div>
        <span className="login-copyright">© 2026 نخبة — نموذج أولي لواجهة المنصة</span>
      </section>
    </main>
  );
}

function StatCard({ title, value, detail, icon, tone, trend }: { title: string; value: string; detail: string; icon: string; tone: string; trend?: string }) {
  return <div className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon name={icon} size={19}/></div><span className="stat-label">{title}</span><div className="stat-value-row"><strong>{value}</strong>{trend && <span className="stat-trend">↗ {trend}</span>}</div><small>{detail}</small></div>;
}

function SectionTitle({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="button button-outline" onClick={onAction}><Icon name="plus" size={16}/>{action}</button>}</div>;
}

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status-pill status-${tone}`}><i/>{children}</span>;
}

function DashboardOverview({ role, data, platformData, onNavigate }: { role: DemoRole; data: DemoAcademyData; platformData: DemoPlatformData; onNavigate: (key: NavKey) => void }) {
  const profile = getDemoProfile(role)!;
  const isParent = role === "parent";
  const isPlayer = role === "player";
  const isCoach = role === "coach";
  const isPlatform = role === "platform_admin";
  const child = data.players[0];
  const childGoals = child ? data.goals.filter((item) => item.playerId === child.id) : [];
  const averageAttendance = meanAttendance(data.players);
  const totalPlayers = data.players.filter((player) => player.enrollmentStatus === "نشط").length;
  const followUpCount = data.players.filter((player) => player.needsFollowUp).length;
  const ratingFields: { key: keyof DemoPlayer["ratings"]; label: string }[] = [{ key: "technical", label: "فني" }, { key: "tactical", label: "تكتيكي" }, { key: "physical", label: "بدني" }, { key: "mental", label: "ذهني" }];
  const performanceScores = ratingFields.map(({ key, label }) => ({ label, score: data.players.filter((player) => player.rating > 0).length ? data.players.filter((player) => player.rating > 0).reduce((sum, player) => sum + player.ratings[key], 0) / data.players.filter((player) => player.rating > 0).length : 0 }));
  const roleTitle = isParent ? `متابعة ${child?.name ?? "أبنائك"} أصبحت أسهل` : isPlayer ? `رحلتك مستمرة، ${child?.name.split(" ")[0] ?? "لاعب"}` : isCoach ? "جاهز لتدريب اليوم؟" : isPlatform ? "نظرة عامة على المنصة" : "صباح الخير، " + profile.name.split(" ")[0];
  const roleSub = isParent ? `إليك ملخص نشاط ${child?.name ?? "اللاعب"} هذا الأسبوع.` : isPlayer ? "خطوة صغيرة كل يوم تقربك من هدفك." : isCoach ? `هذا ملخص ${data.teams[0]?.name ?? "فريقك"} لهذا الأسبوع.` : isPlatform ? "متابعة الأكاديميات وحالة المنصة." : "إليك ما يحدث في أكاديمية النخبة اليوم.";

  if (isParent || isPlayer) {
    if (!child) return <div className="panel schedule-empty">لا يوجد لاعب مرتبط بهذا الحساب التجريبي.</div>;
    const goal = childGoals[0];
    return <>
      <div className="welcome-banner welcome-parent"><div className="welcome-copy"><span className="eyebrow">{isParent ? "ملخص المتابعة" : "ملفك الرياضي"}</span><h2>{roleTitle}</h2><p>{roleSub}</p><button className="button button-light" onClick={() => onNavigate(isPlayer ? "progress" : "reports")}> {isPlayer ? "عرض تقدمي" : "عرض آخر تقرير"}<Icon name="arrow" size={15}/></button></div><div className="welcome-illustration"><div className="welcome-blob"><span>⚽</span></div><div className="welcome-stat"><small>نسبة الحضور</small><strong>{child.attendance}%</strong><span>هذا الموسم</span></div></div></div>
      <div className="stats-grid stats-grid-three"><StatCard title="الحضور" value={`${child.attendance}%`} detail="هذا الموسم" icon="check" tone="green"/><StatCard title="آخر تقييم" value={`${child.rating.toFixed(1)} / 5`} detail="مستوى اللاعب الحالي" icon="chart" tone="purple"/><StatCard title="أهداف نشطة" value={String(childGoals.length)} detail={goal ? `أقرب مراجعة ${goal.due}` : "لا توجد أهداف حالية"} icon="target" tone="orange"/></div>
      <div className="content-grid content-grid-parent"><section className="panel schedule-panel"><div className="panel-heading"><div><h3>{isPlayer ? "تدريباتك القادمة" : `جدول ${child.name} القادم`}</h3><p>الأسبوع الحالي</p></div><button className="text-link" onClick={() => onNavigate("schedule")}>عرض الجدول <Icon name="arrow" size={14}/></button></div><SessionList sessions={data.sessions.filter((session) => session.teamId === child.teamId).slice(0, 3)} teams={data.teams}/></section><section className="panel progress-panel"><div className="panel-heading"><div><h3>{isPlayer ? "هدفي الحالي" : "هدف التطوير الحالي"}</h3><p>آخر تحديث من المدرب</p></div><span className="mini-icon">✦</span></div>{goal ? <div className="goal-feature"><span className="goal-category">تطوير {goal.category}</span><h4>{goal.title}</h4><p>خطوات عملية ومراجعة دورية مع المدرب.</p><Progress value={goal.progress}/><div className="goal-meta"><span>التقدم <b>{goal.progress}%</b></span><span>المراجعة {goal.due}</span></div></div> : <div className="schedule-empty">لا توجد خطة تطوير منشورة حالياً.</div>}<button className="button button-ghost full-button" onClick={() => onNavigate("development")}>تفاصيل خطة التطوير <Icon name="arrow" size={15}/></button></section></div>
      <div className="content-grid lower-grid"><section className="panel"><div className="panel-heading"><div><h3>آخر تقييم رياضي</h3><p>أحدث تقييم متاح</p></div><button className="icon-button" aria-label="عرض التقييمات" onClick={() => onNavigate(isPlayer ? "progress" : "reports")}><Icon name="arrow" size={16}/></button></div><div className="rating-row"><div className="rating-circle"><strong>{child.rating.toFixed(1)}</strong><small>من 5</small></div><div className="rating-breakdown"><RatingLine label="فني" value={child.ratings.technical * 20}/><RatingLine label="تكتيكي" value={child.ratings.tactical * 20}/><RatingLine label="بدني" value={child.ratings.physical * 20}/><RatingLine label="ذهني" value={child.ratings.mental * 20}/></div></div></section><section className="panel"><div className="panel-heading"><div><h3>ملف اللاعب</h3><p>{child.name} · {teamName(data, child.teamId)}</p></div><Avatar initials={child.initials} color={child.color} small/></div><blockquote className="coach-note">مركز اللاعب: {child.position} · القدم المفضلة: {child.preferredFoot}.</blockquote>{isParent && <div className="note-footer"><span>ولي الأمر المرتبط: {child.guardianName}</span><span>•••</span></div>}</section></div>
    </>;
  }

  if (role === "owner") {
    const manager = demoProfiles.find((person) => person.id === data.managerUserId);
    return <>
    <div className="page-intro"><div><span className="eyebrow">نظرة المالك</span><h1>صباح الخير، {profile.name.split(" ")[0]}</h1><p>ملخص أداء {data.academyName} — {data.season}</p></div><button className="button button-primary" onClick={() => onNavigate("reports")}><Icon name="report" size={16}/>التقارير</button></div>
    <div className="stats-grid"><StatCard title="اللاعبون النشطون" value={String(totalPlayers)} detail={`في ${data.teams.length} فرق تجريبية`} icon="users" tone="green"/><StatCard title="متوسط الحضور" value={`${averageAttendance}%`} detail="متوسط سجلات العينة" icon="check" tone="purple"/><StatCard title="المدربون والموظفون" value={String(data.staff.length)} detail="أعضاء في بيانات العرض" icon="coach" tone="orange"/><StatCard title="لاعبون بحاجة إلى متابعة" value={String(followUpCount)} detail="من السجلات التجريبية" icon="report" tone="blue"/></div>
    <div className="owner-dashboard-grid"><section className="panel owner-summary"><div className="panel-heading"><div><h3>ملخص الأكاديمية</h3><p>مؤشرات عامة لهذا الموسم</p></div><span className="status-pill"><i/>الأكاديمية نشطة</span></div><div className="owner-metric"><span>لاعبون لديهم تقييم وبيانات رياضية</span><strong>{Math.round(data.players.filter((player) => player.rating > 0).length / Math.max(1, totalPlayers) * 100)}%</strong><Progress value={Math.round(data.players.filter((player) => player.rating > 0).length / Math.max(1, totalPlayers) * 100)}/></div><div className="owner-metric"><span>اكتمال بيانات التسجيل</span><strong>{Math.round(data.players.filter((player) => player.enrollmentStatus === "نشط").length / Math.max(1, data.players.length) * 100)}%</strong><Progress value={Math.round(data.players.filter((player) => player.enrollmentStatus === "نشط").length / Math.max(1, data.players.length) * 100)}/></div><div className="owner-summary-footer"><span>الأرقام محسوبة من بيانات العرض</span><button className="text-link" onClick={() => onNavigate("reports")}>عرض تقارير الأداء <Icon name="arrow" size={14}/></button></div></section><section className="panel owner-control"><div className="owner-control-icon"><Icon name="academy" size={21}/></div><span className="eyebrow">إدارة الأكاديمية</span><h3>الفروع وفرق العمل</h3><p>تنقل بين الفروع، وأدر اللاعبين والمدربين والجدول والتقارير من الحساب نفسه.</p><div className="owner-manager-line"><Avatar initials={manager?.initials ?? "؟"} color={manager?.color ?? "peach"} small/><span><strong>{data.branches.length === 1 ? data.branches[0].managerName : `${data.branches.length} فروع`}</strong><small>{data.branches.length === 1 ? "مدير الفرع" : "فروع الأكاديمية"}</small></span><StatusPill>إدارة كاملة</StatusPill></div><button className="button button-ghost full-button" onClick={() => onNavigate("branches")}>إدارة الفروع <Icon name="arrow" size={15}/></button></section></div>
    <div className="owner-report-link"><span><strong>تقارير الأكاديمية جاهزة للمراجعة</strong><small>راجع الحضور وتقدم اللاعبين، وانتقل إلى سجلاتهم من صفحات الإدارة.</small></span><button className="button button-outline" onClick={() => onNavigate("reports")}>فتح التقارير <Icon name="arrow" size={15}/></button></div>
    </>;
  }

  if (isPlatform) { const academyCount = platformData.academies.length; const playerCount = platformData.academies.reduce((sum, academy) => sum + academy.players, 0); const activeUsers = platformData.academies.reduce((sum, academy) => sum + academy.activeUsers, 0); const activeAcademies = platformData.academies.filter((academy) => academy.status === "نشطة").length; return <>
    <div className="page-intro"><div><span className="eyebrow">مركز التحكم</span><h1>{roleTitle}</h1><p>{roleSub}</p></div><button className="button button-primary" onClick={() => onNavigate("academies")}><Icon name="plus" size={17}/>إضافة أكاديمية</button></div>
    <div className="stats-grid"><StatCard title="الأكاديميات في العرض" value={String(academyCount)} detail={`${activeAcademies} نشطة · ${academyCount - activeAcademies} بانتظار التفعيل`} icon="academy" tone="green"/><StatCard title="المستخدمون النشطون" value={activeUsers.toLocaleString("ar-SA")} detail="مجموع الأكاديميات المعروضة" icon="users" tone="purple"/><StatCard title="اللاعبون المسجلون" value={playerCount.toLocaleString("ar-SA")} detail="مجموع الأكاديميات المعروضة" icon="teams" tone="orange"/><StatCard title="حالة المنصة" value="مستقرة" detail="حالة تجريبية" icon="activity" tone="blue"/></div>
    <div className="content-grid"><AcademyTable academies={platformData.academies} onOpen={() => onNavigate("academies")}/><section className="panel"><div className="panel-heading"><div><h3>نشاط المنصة</h3><p>مستخدمون نشطون — بيانات تجريبية</p></div><span className="mini-icon">↗</span></div><div className="chart-placeholder"><div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="chart-bars">{platformData.weeklyActiveUsers.map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}</div></div><div className="chart-legend"><span><i className="legend-green"/> مستخدمون نشطون</span><span>12 أسبوعاً</span></div></section></div>
  </>; }

  const coachMode = isCoach;
  return <>
    <div className="page-intro"><div><span className="eyebrow">{coachMode ? "مساحة المدرب" : "لوحة الأكاديمية"}</span><h1>{roleTitle}</h1><p>{roleSub}</p></div><div className="intro-actions"><span className="date-chip"><Icon name="calendar" size={15}/> الأحد، 8 نوفمبر 2026</span>{!coachMode && <button className="button button-primary" onClick={() => onNavigate("players")}><Icon name="plus" size={17}/>تسجيل لاعب</button>}</div></div>
    <div className="stats-grid">
      <StatCard title={coachMode ? "لاعبو فريقي" : "إجمالي اللاعبين"} value={String(totalPlayers)} detail="من بيانات العرض الحالية" icon="users" tone="green"/>
      <StatCard title="الفرق النشطة" value={String(data.teams.length)} detail="ضمن نطاق هذا الحساب" icon="teams" tone="purple"/>
      <StatCard title="متوسط الحضور" value={`${averageAttendance}%`} detail="متوسط سجلات اللاعبين الظاهرة" icon="check" tone="orange"/>
      <StatCard title="لاعبون يحتاجون متابعة" value={String(followUpCount)} detail="ضمن النطاق الحالي" icon="chart" tone="blue"/>
    </div>
    <div className="content-grid main-dashboard-grid">
      <section className="panel performance-panel"><div className="panel-heading"><div><h3>{coachMode ? "مستوى فريقي" : "متوسط تقييم الأكاديمية"}</h3><p>حسب أبعاد التقييم المنشورة · من 5</p></div><span className="select-chip">{data.players.filter((player) => player.rating > 0).length} ملفات مقيمة</span></div><div className="domain-scores">{performanceScores.map(({ label, score }) => <div className="domain-score" key={label}><span>{label}</span><Progress value={Math.round(score * 20)}/><strong>{score.toFixed(1)}</strong></div>)}</div><div className="chart-legend"><span><i className="legend-green"/> متوسط العينة الظاهرة</span><span>لا يمثل سلسلة زمنية</span></div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h3>مواعيد اليوم</h3><p>الأحد، 8 نوفمبر</p></div><button className="text-link" onClick={() => onNavigate("schedule")}>الجدول <Icon name="arrow" size={14}/></button></div><SessionList sessions={data.sessions.slice(0, 3)} teams={data.teams}/></section>
    </div>
    <div className="content-grid lower-grid">
      <section className="panel player-panel"><div className="panel-heading"><div><h3>{coachMode ? "لاعبو فريقي" : "آخر اللاعبين"}</h3><p>{coachMode ? "نظرة سريعة على تقدم اللاعبين" : "ملخص ملفات اللاعبين النشطة"}</p></div><button className="text-link" onClick={() => onNavigate("players")}>كل اللاعبين <Icon name="arrow" size={14}/></button></div><PlayerTable players={data.players.slice(0, 4)} teams={data.teams} compact/></section>
      <section className="panel attention-panel"><div className="panel-heading"><div><h3>تحتاج إلى متابعة</h3><p>تنبيهات ضمن نطاق هذا الحساب</p></div><span className="alert-count">{followUpCount + data.goals.filter((goal) => goal.state === "تحتاج متابعة").length}</span></div><div className="attention-list">{data.players.filter((player) => player.needsFollowUp).map((player) => <AttentionItem key={player.id} icon="!" tone="peach" title="مراجعة تقدم اللاعب" detail={`${player.name} · حضور ${player.attendance}%`}/>)}{data.goals.filter((goal) => goal.state === "تحتاج متابعة").map((goal) => { const player = data.players.find((item) => item.id === goal.playerId); return <AttentionItem key={goal.id} icon="↗" tone="lavender" title={goal.title} detail={`${player?.name ?? "لاعب"} · مراجعة ${goal.due}`}/>; })}{followUpCount === 0 && !data.goals.some((goal) => goal.state === "تحتاج متابعة") && <div className="schedule-empty">لا توجد تنبيهات متابعة حالياً.</div>}</div><button className="button button-ghost full-button" onClick={() => onNavigate("development")}>مراجعة خطط التطوير <Icon name="arrow" size={15}/></button></section>
    </div>
  </>;
}

function teamName(data: DemoAcademyData, teamId: string) { return data.teams.find((team) => team.id === teamId)?.name ?? "فريق غير محدد"; }
function teamLabel(teams: DemoTeam[], teamId: string) { return teams.find((team) => team.id === teamId)?.name ?? "فريق غير محدد"; }
function teamRosterSize(data: DemoAcademyData, teamId: string) { return data.players.filter((player) => player.teamId === teamId && player.enrollmentStatus === "نشط").length; }
function meanAttendance(players: DemoPlayer[]) { const activePlayers = players.filter((player) => player.enrollmentStatus === "نشط"); return activePlayers.length ? Math.round(activePlayers.reduce((total, player) => total + player.attendance, 0) / activePlayers.length) : 0; }
function meanRating(ratings: DemoPlayer["ratings"]) { return Number((Object.values(ratings).reduce((sum, value) => sum + value, 0) / 4).toFixed(1)); }
function statusTone(status: DemoPlayer["enrollmentStatus"]) {
  if (status === "نشط") return "green";
  if (status === "بانتظار موافقة ولي الأمر" || status === "غير مكتمل") return "orange";
  if (status === "موقوف مؤقتاً") return "red";
  return "purple";
}

function SessionList({ sessions, teams }: { sessions: DemoSession[]; teams: DemoTeam[] }) {
  return <div className="session-list">{sessions.map((session) => <div className="session-item" key={session.id}><div className="session-time"><b>{session.time.replace(" ", "")}</b><span>{session.day}</span></div><div className="session-divider"/><div className="session-description"><strong>{session.title}</strong><span>{teams.find((team) => team.id === session.teamId)?.name ?? "فريق غير محدد"} · {session.location}</span></div><span className={`session-kind ${session.kind === "مباراة" ? "kind-match" : ""}`}>{session.kind}</span></div>)}</div>;
}

function PlayerTable({ players, teams, compact = false, onSelect }: { players: DemoPlayer[]; teams: DemoTeam[]; compact?: boolean; onSelect?: (player: DemoPlayer) => void }) {
  return <div className={`table-wrap ${compact ? "table-compact" : ""}`}><table><thead><tr><th>اللاعب</th><th>الفريق</th><th>الحضور</th><th>التقييم</th><th>الحالة</th><th/></tr></thead><tbody>{players.map((player) => <tr key={player.id}><td><div className="player-cell"><Avatar initials={player.initials} color={player.color} small/><span><strong>{player.name}</strong><small>{player.age} سنة · {player.position}</small></span></div></td><td>{teamLabel(teams, player.teamId)}</td><td><div className="attendance-cell"><span>{player.attendance}%</span><i><b style={{ width: `${player.attendance}%` }}/></i></div></td><td><span className="rating-small">{player.rating > 0 ? `★ ${player.rating.toFixed(1)}` : "—"}</span></td><td><StatusPill tone={statusTone(player.enrollmentStatus)}>{player.enrollmentStatus}</StatusPill>{player.needsFollowUp && <span className="follow-up-tag">متابعة</span>}</td><td>{onSelect ? <button className="row-more" aria-label={`فتح ملف ${player.name}`} title={`فتح ملف ${player.name}`} onClick={() => onSelect(player)}><Icon name="arrow" size={14}/></button> : <span aria-hidden="true">—</span>}</td></tr>)}</tbody></table></div>;
}

function Progress({ value }: { value: number }) { return <div className="progress-track"><span style={{ width: `${value}%` }}/></div>; }
function RatingLine({ label, value }: { label: string; value: number }) { return <div className="rating-line"><span>{label}</span><i><b style={{ width: `${value}%` }}/></i><strong>{(value / 20).toFixed(1)}</strong></div>; }
function AttentionItem({ icon, tone, title, detail }: { icon: string; tone: string; title: string; detail: string }) { return <div className="attention-item"><span className={`attention-icon ${tone}`}>{icon}</span><span><strong>{title}</strong><small>{detail}</small></span><Icon name="arrow" size={14}/></div>; }
function formatArabicDate(value: string | null) { if (!value) return "لا يوجد تقييم"; const [year, month, day] = value.split("-").map(Number); const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]; return `${day} ${months[month - 1]} ${year}`; }

function PlayerPage({ players, teams, onAdd, onSelect, canAdd = true }: { players: DemoPlayer[]; teams: DemoTeam[]; onAdd: () => void; onSelect: (player: DemoPlayer) => void; canAdd?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("الكل");
  const filtered = players.filter((player) => player.name.includes(query) && (filter === "الكل" || (filter === "بحاجة إلى متابعة" ? player.needsFollowUp : player.enrollmentStatus === filter)));
  return <><SectionTitle title="اللاعبون" subtitle="إدارة ملفات اللاعبين ومتابعة تسجيلهم في الأكاديمية." action={canAdd ? "تسجيل لاعب" : undefined} onAction={onAdd}/><div className="filter-bar"><label className="search-field"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم اللاعب..."/></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>الكل</option><option>بحاجة إلى متابعة</option><option>نشط</option><option>غير مكتمل</option><option>بانتظار موافقة ولي الأمر</option><option>موقوف مؤقتاً</option><option>منسحب</option><option>متخرج</option></select><span className="results-count">{filtered.length} لاعب</span></div><section className="panel table-panel"><PlayerTable players={filtered} teams={teams} onSelect={onSelect}/></section><div className="tip-banner"><span>✦</span><p><strong>التسجيل يتم من داخل الأكاديمية.</strong> بيانات ولي الأمر تُدخلها الأكاديمية عند إنشاء الملف، ثم ترسل دعوة الربط من النظام الفعلي.</p></div></>;
}

function TeamsPage({ data, role, onToast, onCreate, availableStaff = data.staff }: { data: DemoAcademyData; role: DemoRole; onToast: (text: string) => void; onCreate: (team: DemoTeam) => void; availableStaff?: DemoStaff[] }) {
  const canManage = role === "manager" || role === "owner";
  const [showForm, setShowForm] = useState(false);
  return <><SectionTitle title={role === "coach" ? "فريقي" : "الفرق والفئات"} subtitle="توزيع اللاعبين حسب الفئة العمرية والفريق التدريبي." action={canManage ? "إضافة فريق" : undefined} onAction={() => setShowForm(true)}/><div className="team-grid">{data.teams.map((team, index) => { const coach = data.staff.find((person) => person.id === team.coachId) ?? availableStaff.find((person) => person.id === team.coachId); const next = data.sessions.find((session) => session.teamId === team.id); const branch = data.branches.find((item) => item.id === team.branchId); return <article className="team-card panel" key={team.id}><div className={`team-card-art art-${team.color}`}><span className="team-ball">⚽</span><span className="team-number">{String(index + 1).padStart(2, "0")}</span></div><div className="team-card-body"><div className="team-title-row"><div><h3>{team.name}</h3><p>{branch?.name ?? "فرع"} · الفئة {team.ageGroup}</p></div><button className="row-more" aria-label={`خيارات ${team.name}`} onClick={() => onToast(`الفريق ${team.name} · المدرب ${coach?.name ?? "غير مسند"}`)}>···</button></div><div className="team-meta"><span><Icon name="users" size={15}/>{teamRosterSize(data, team.id)} لاعب</span><span><Icon name="coach" size={15}/>{coach?.name ?? "غير مسند"}</span></div><div className="team-next"><small>التدريب القادم</small><strong>{next ? `${next.day}، ${next.time}` : "لا يوجد موعد"}</strong></div><button className="button button-ghost full-button" onClick={() => onToast(`عرض تفاصيل ${team.name}`)}>عرض الفريق <Icon name="arrow" size={15}/></button></div></article>; })}</div>{data.teams.length === 0 && <div className="panel schedule-empty">لا توجد فرق في هذا الفرع. أضف أول فريق لبدء التسجيل.</div>}{showForm && <TeamModal branches={data.branches} staff={availableStaff} onClose={() => setShowForm(false)} onSave={(team) => { onCreate(team); setShowForm(false); }}/>}</>;
}

function TeamModal({ branches, staff, onClose, onSave }: { branches: DemoBranch[]; staff: DemoStaff[]; onClose: () => void; onSave: (team: DemoTeam) => void }) {
  const [name, setName] = useState(""); const [branchId, setBranchId] = useState(branches[0]?.id ?? ""); const [ageGroup, setAgeGroup] = useState("2013 – 2014"); const [coachId, setCoachId] = useState(staff.find((person) => person.teamIds.length)?.id ?? ""); const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !branchId || !coachId) { setError("أدخل اسم الفريق وحدد الفرع والمدرب."); return; } onSave({ id: `t-local-${Date.now()}`, branchId, name: name.trim(), ageGroup, coachId, color: "mint" }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">تنظيم الفرق</span><h2>إضافة فريق</h2><p>اربط الفريق بفرع ومدرب.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم الفريق *<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: فريق البراعم C"/></label><div className="form-two"><label>الفرع *<select value={branchId} onChange={(event) => setBranchId(event.target.value)}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label>الفئة العمرية *<select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}><option>2015 – 2016</option><option>2013 – 2014</option><option>2011 – 2012</option><option>2009 – 2010</option></select></label></div><label>المدرب المسؤول *<select value={coachId} onChange={(event) => setCoachId(event.target.value)}>{staff.filter((person) => person.active).map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">حفظ الفريق</button></div></form></div>;
}

function SchedulePage({ sessions, teams, canManage, onToast, onCreate }: { sessions: DemoSession[]; teams: DemoTeam[]; canManage: boolean; onToast: (text: string) => void; onCreate: (session: DemoSession) => void }) {
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const [selectedDay, setSelectedDay] = useState("الكل"); const [selectedTeam, setSelectedTeam] = useState("الكل"); const [showForm, setShowForm] = useState(false);
  const visible = sessions.filter((session) => (selectedDay === "الكل" || session.day === selectedDay) && (selectedTeam === "الكل" || session.teamId === selectedTeam));
  return <><SectionTitle title="الجدول التدريبي" subtitle="اختر اليوم والفريق لمراجعة التدريبات والمباريات." action={canManage ? "إضافة موعد" : undefined} onAction={() => setShowForm(true)}/><div className="week-strip"><button className={`week-day ${selectedDay === "الكل" ? "week-day-active" : ""}`} onClick={() => setSelectedDay("الكل")}><small>كل</small><strong>الأسبوع</strong><span>{selectedDay === "الكل" ? "مختار" : ""}</span></button>{days.map((day, index) => <button key={day} className={`week-day ${selectedDay === day ? "week-day-active" : ""}`} onClick={() => setSelectedDay(day)}><small>{day}</small><strong>{String(8 + index).padStart(2, "0")}</strong><span>{index === 0 ? "اليوم" : ""}</span></button>)}</div><div className="panel schedule-page-panel"><div className="schedule-date-heading"><div><span className="eyebrow">مواعيد الأسبوع</span><h3>{selectedDay === "الكل" ? "كل المواعيد القادمة" : `مواعيد يوم ${selectedDay}`}</h3></div><label className="select-chip">الفريق<select aria-label="تصفية حسب الفريق" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}><option>الكل</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label></div><SessionList sessions={visible} teams={teams}/>{visible.length === 0 && <div className="schedule-empty"><span>＋</span><p>لا توجد مواعيد مطابقة للتصفية.</p></div>}</div>{showForm && <ScheduleModal teams={teams} onClose={() => setShowForm(false)} onSave={(session) => { onCreate(session); setShowForm(false); setSelectedDay(session.day); setSelectedTeam("الكل"); }}/>}</>;
}

function ScheduleModal({ teams, onClose, onSave }: { teams: DemoTeam[]; onClose: () => void; onSave: (session: DemoSession) => void }) {
  const weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const [title, setTitle] = useState(""); const [teamId, setTeamId] = useState(teams[0]?.id ?? ""); const [day, setDay] = useState("الأحد"); const [date, setDate] = useState("2026-11-15"); const [time, setTime] = useState("17:30"); const [location, setLocation] = useState(""); const [kind, setKind] = useState<DemoSession["kind"]>("تدريب"); const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const read = (key: string, fallback: string) => { const value = form.get(key); return value === null ? fallback : String(value); }; const submittedTitle = read("title", title).trim(); const submittedDate = read("date", date); const submittedTime = read("time", time); const submittedTeamId = read("team", teamId); const submittedLocation = read("location", location).trim(); const submittedKind = read("kind", kind) as DemoSession["kind"]; const localDate = new Date(`${submittedDate}T12:00:00`); if (!submittedTitle || !submittedDate || !submittedTime || !submittedTeamId || !submittedLocation || Number.isNaN(localDate.getTime())) { setError("أكمل عنوان الموعد والفريق والتاريخ والوقت والموقع."); return; } const submittedDay = weekdays[localDate.getDay()]; const dateLabel = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { day: "2-digit", month: "long" }).format(localDate); onSave({ id: `s-local-${Date.now()}`, day: submittedDay, date: dateLabel, time: new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { hour: "numeric", minute: "2-digit" }).format(new Date(`${submittedDate}T${submittedTime}:00`)), title: submittedTitle, teamId: submittedTeamId, location: submittedLocation, kind: submittedKind }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">الجدول التدريبي</span><h2>إضافة موعد</h2><p>أدخل بيانات التدريب أو المباراة.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>عنوان الموعد *<input name="title" autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: تطوير التمرير"/></label><div className="form-two"><label>الفريق *<select name="team" value={teamId} onChange={(event) => setTeamId(event.target.value)}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label><label>نوع الموعد<select name="kind" value={kind} onChange={(event) => setKind(event.target.value as DemoSession["kind"])}><option>تدريب</option><option>مباراة</option></select></label></div><div className="form-two"><label>التاريخ *<input name="date" type="date" required value={date} onChange={(event) => { setDate(event.target.value); if (event.target.value) setDay(weekdays[new Date(`${event.target.value}T12:00:00`).getDay()]); }}/></label><label>اليوم المحسوب<input value={day} readOnly/></label></div><div className="form-two"><label>الوقت *<input name="time" type="time" required value={time} onChange={(event) => setTime(event.target.value)}/></label><label>الموقع *<input name="location" required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="الملعب"/></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">حفظ الموعد</button></div></form></div>;
}

function AttendancePage({ players, session, teams, readOnly = false, onSaveAttendance }: { players: DemoPlayer[]; session: DemoSession; teams: DemoTeam[]; readOnly?: boolean; onSaveAttendance: (records: AttendanceMark[]) => Promise<void> }) {
  const [states, setStates] = useState<Record<string, string>>({});
  const options = ["حاضر", "متأخر", "غياب بعذر", "غياب"];
  const playerScopeKey = players.map((player) => player.id).join("|");
  useEffect(() => { let live = true; const allowedPlayerIds = new Set(playerScopeKey.split("|").filter(Boolean)); academyRepository.getAttendance(session.id).then((records) => { if (live) setStates(Object.fromEntries(records.filter((record) => allowedPlayerIds.has(record.playerId)).map((record) => [record.playerId, record.status]))); }); return () => { live = false; }; }, [session.id, playerScopeKey]);
  return <><SectionTitle title={readOnly ? "متابعة الحضور" : "تسجيل الحضور"} subtitle={`${session.title} · ${teamLabel(teams, session.teamId)} · ${session.time}`} action={readOnly ? undefined : "حفظ الحضور"} onAction={() => { void onSaveAttendance(players.map((player) => ({ playerId: player.id, status: states[player.id] ?? "لم يسجل" }))); }}/><div className="attendance-summary"><div><span className="summary-check">✓</span><span><strong>{readOnly ? "حضور اللاعب" : "حضور التدريب"}</strong><small>{session.day}، {session.date} · {session.location}</small></span></div><div className="attendance-counts"><span><b>{Object.values(states).filter((s) => s === "حاضر").length}</b> حاضر</span><span><b>{Object.values(states).filter((s) => s.includes("غياب")).length}</b> غائب</span><span><b>{Object.values(states).filter((s) => s === "متأخر").length}</b> متأخر</span></div></div><section className="panel attendance-list-panel"><div className="attendance-list-head"><span>اللاعب ({players.length})</span><span>حالة الحضور</span></div>{players.map((player) => <div className="attendance-row" key={player.id}><div className="player-cell"><Avatar initials={player.initials} color={player.color} small/><span><strong>{player.name}</strong><small>{player.position}</small></span></div><div className="attendance-choice">{readOnly ? <StatusPill tone={states[player.id] === "حاضر" ? "green" : "orange"}>{states[player.id] ?? "لم يسجل"}</StatusPill> : options.map((option) => <button key={option} className={states[player.id] === option ? `choice-active choice-${option === "حاضر" ? "green" : option === "متأخر" ? "yellow" : "red"}` : ""} onClick={() => setStates((current) => ({ ...current, [player.id]: option }))}>{option}</button>)}</div></div>)}</section><p className="form-footnote">{readOnly ? "هذه بيانات عرض للمتابعة فقط." : "سجل الحضور المحفوظ يبقى في مخزن العرض حتى إعادة تحميل الصفحة."}</p></>;
}

function AssessmentsPage({ data, role, onToast, onSave }: { data: DemoAcademyData; role: DemoRole; onToast: (text: string) => void; onSave: (playerId: string, ratings: DemoPlayer["ratings"]) => void }) {
  const getScale = (score: number) => Math.round(score * 20);
  const [showForm, setShowForm] = useState(false);
  const assessedPlayers = data.players.filter((player) => player.lastAssessedAt && player.rating > 0);
  return <><SectionTitle title={role === "parent" ? "التقارير والتقييمات" : role === "player" ? "تقدمي الرياضي" : "التقييمات الرياضية"} subtitle={role === "parent" ? "التقارير التي نشرتها الأكاديمية لولي الأمر." : "تابع مستوى اللاعبين في الجوانب الفنية والتكتيكية والبدنية والذهنية."} action={role === "parent" || role === "player" ? undefined : "تقييم جديد"} onAction={() => setShowForm(true)}/>{assessedPlayers.length ? <div className="assessment-grid">{assessedPlayers.map((player) => <article className="panel assessment-card" key={player.id}><div className="assessment-card-top"><div className="player-cell"><Avatar initials={player.initials} color={player.color} small/><span><strong>{player.name}</strong><small>{teamName(data, player.teamId)}</small></span></div><span className="assessment-date">{formatArabicDate(player.lastAssessedAt)}</span></div><div className="assessment-score"><div className="score-number"><strong>{player.rating.toFixed(1)}</strong><span>/ 5</span></div><span className="score-label"><i>★</i> مستوى {player.rating >= 4.3 ? "متقدم" : "جيد جداً"}</span></div><div className="mini-ratings"><RatingLine label="فني" value={getScale(player.ratings.technical)}/><RatingLine label="تكتيكي" value={getScale(player.ratings.tactical)}/><RatingLine label="بدني" value={getScale(player.ratings.physical)}/><RatingLine label="ذهني" value={getScale(player.ratings.mental)}/></div><button className="button button-ghost full-button" onClick={() => onToast(`تفاصيل تقييم ${player.name}: فني ${player.ratings.technical}، تكتيكي ${player.ratings.tactical}، بدني ${player.ratings.physical}، ذهني ${player.ratings.mental} من 5`)}>عرض تفاصيل التقييم <Icon name="arrow" size={15}/></button></article>)}</div> : <div className="panel schedule-empty">لا توجد تقييمات منشورة ضمن البيانات الحالية.</div>}{showForm && <AssessmentModal players={data.players} onClose={() => setShowForm(false)} onSave={(playerId, ratings) => { onSave(playerId, ratings); setShowForm(false); }}/>}</>;
}

function AssessmentModal({ players, onClose, onSave }: { players: DemoPlayer[]; onClose: () => void; onSave: (playerId: string, ratings: DemoPlayer["ratings"]) => void }) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? ""); const [ratings, setRatings] = useState<DemoPlayer["ratings"]>({ technical: 3, tactical: 3, physical: 3, mental: 3 });
  const fields: { key: keyof DemoPlayer["ratings"]; label: string }[] = [{ key: "technical", label: "المهارة الفنية" }, { key: "tactical", label: "الفهم التكتيكي" }, { key: "physical", label: "الجاهزية البدنية" }, { key: "mental", label: "التركيز الذهني" }];
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={(event) => { event.preventDefault(); if (playerId) onSave(playerId, ratings); }}><div className="modal-heading"><div><span className="eyebrow">تقييم رياضي</span><h2>تسجيل تقييم لاعب</h2><p>اختر الدرجة من 1 إلى 5 لكل جانب.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اللاعب *<select required value={playerId} onChange={(event) => setPlayerId(event.target.value)}>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select></label>{fields.map(({ key, label }) => <label className="range-field" key={key}><span>{label}<b>{ratings[key].toFixed(1)} / 5</b></span><input type="range" min="1" max="5" step="0.1" value={ratings[key]} onChange={(event) => setRatings((current) => ({ ...current, [key]: Number(event.target.value) }))}/></label>)}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">حفظ التقييم</button></div></form></div>;
}

function DevelopmentPage({ goals, players, role, onToast, onCreate, onUpdate }: { goals: DemoAcademyData["goals"]; players: DemoPlayer[]; role: DemoRole; onToast: (text: string) => void; onCreate: (goal: DemoAcademyData["goals"][number]) => void; onUpdate: (goalId: string, progress: number) => void }) {
  const [showForm, setShowForm] = useState(false); const canEdit = role !== "player" && role !== "parent";
  return <><SectionTitle title={role === "player" ? "أهدافي" : "خطط التطوير الفردية"} subtitle="أهداف واضحة، خطوات عملية، ومراجعة مستمرة لتقدم اللاعب." action={canEdit ? "إضافة هدف" : undefined} onAction={() => setShowForm(true)}/><div className="goal-list">{goals.map((goal) => { const player = players.find((item) => item.id === goal.playerId); return <article className="panel goal-row" key={goal.id}><div className="goal-player"><Avatar initials={player?.initials ?? "؟"} color={player?.color ?? "mint"} small/><span><strong>{player?.name ?? "لاعب غير متاح"}</strong><small>{goal.category} · {goal.state}</small></span></div><div className="goal-main"><h3>{goal.title}</h3><div className="goal-progress-line"><Progress value={goal.progress}/><strong>{goal.progress}%</strong></div></div><div className="goal-due"><small>موعد المراجعة</small><strong>{goal.due}</strong></div>{canEdit ? <button className="goal-update-button" onClick={() => onUpdate(goal.id, Math.min(100, goal.progress + 10))} title="زيادة التقدم 10٪">+10٪</button> : <span/>}</article>; })}</div>{goals.length === 0 && <div className="panel schedule-empty">لا توجد أهداف متاحة ضمن صلاحيات الحساب.</div>}<div className="tip-banner"><span>✦</span><p>كل خطة تطوير تتضمن هدفاً قابلاً للقياس، خطوات تدريبية، وموعداً لمراجعة التقدم. زر +10٪ يحاكي تحديث المدرب للتقدم.</p></div>{showForm && <GoalModal players={players} onClose={() => setShowForm(false)} onSave={(goal) => { onCreate(goal); setShowForm(false); }}/>}</>;
}

function GoalModal({ players, onClose, onSave }: { players: DemoPlayer[]; onClose: () => void; onSave: (goal: DemoAcademyData["goals"][number]) => void }) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? ""); const [title, setTitle] = useState(""); const [category, setCategory] = useState("فني"); const [due, setDue] = useState("2026-11-30"); const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const read = (key: string, fallback: string) => { const value = form.get(key); return value === null ? fallback : String(value); }; const submittedPlayerId = read("player", playerId); const submittedTitle = read("title", title).trim(); const submittedCategory = read("category", category); const submittedDue = read("due", due); const reviewDateValue = new Date(`${submittedDue}T12:00:00`); if (!submittedPlayerId || !submittedTitle || !submittedDue || Number.isNaN(reviewDateValue.getTime())) { setError("اختر اللاعب واكتب الهدف وحدد موعد المراجعة."); return; } const reviewDate = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { day: "numeric", month: "long" }).format(reviewDateValue); onSave({ id: `g-local-${Date.now()}`, playerId: submittedPlayerId, title: submittedTitle, category: submittedCategory, progress: 0, due: reviewDate, state: "على المسار" }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">خطة تطوير فردية</span><h2>إضافة هدف</h2><p>حدد هدفاً واضحاً وموعداً لمراجعته.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اللاعب *<select name="player" value={playerId} onChange={(event) => setPlayerId(event.target.value)}>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select></label><label>الهدف *<input name="title" autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: تحسين دقة التسديد"/></label><div className="form-two"><label>مجال التطوير<select name="category" value={category} onChange={(event) => setCategory(event.target.value)}><option>فني</option><option>تكتيكي</option><option>بدني</option><option>ذهني</option></select></label><label>موعد المراجعة<input name="due" type="date" required value={due} onChange={(event) => setDue(event.target.value)}/></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">حفظ الهدف</button></div></form></div>;
}

function CoachesPage({ staff, teams, onToast, onInvite }: { staff: DemoAcademyData["staff"]; teams: DemoTeam[]; onToast: (text: string) => void; onInvite: (person: DemoStaff) => void }) {
  const [showInvite, setShowInvite] = useState(false);
  return <><SectionTitle title="المدربون والموظفون" subtitle="أعضاء الفريق وصلاحياتهم ونطاق الفرق المسندة إليهم." action="إضافة مدرب أو موظف" onAction={() => setShowInvite(true)}/><div className="filter-bar"><span className="results-count">{staff.filter((person) => person.active).length} نشط من {staff.length}</span></div><div className="staff-grid">{staff.map((person) => { const assignedTeams = teams.filter((team) => person.teamIds.includes(team.id)).map((team) => team.name); return <article className="panel staff-card" key={person.id}><div className="staff-top"><Avatar initials={person.initials} color={person.color}/><button className="row-more" aria-label={`خيارات ${person.name}`} onClick={() => onToast(`${person.name} · ${person.active ? "الحساب نشط" : "الحساب موقوف"}`)}>···</button></div><h3>{person.name}</h3><p>{person.role}</p><div className="staff-assignment"><small>الفرق / المهام</small><strong>{assignedTeams.length ? assignedTeams.join(" · ") : person.responsibilities.join(" · ")}</strong></div><div className="staff-bottom"><StatusPill tone={person.active ? "green" : "orange"}>{person.active ? "نشط" : "موقوف"}</StatusPill><button className="text-link" onClick={() => onToast(`الصلاحيات المسندة إلى ${person.name}: ${person.responsibilities.join("، ")}`)}>عرض الصلاحيات <Icon name="arrow" size={14}/></button></div></article>; })}</div>{showInvite && <StaffModal teams={teams} onClose={() => setShowInvite(false)} onSave={(person) => { onInvite(person); setShowInvite(false); }}/>}</>;
}

function StaffModal({ teams, onClose, onSave }: { teams: DemoTeam[]; onClose: () => void; onSave: (person: DemoStaff) => void }) {
  const [name, setName] = useState(""); const [role, setRole] = useState("مدرب"); const [teamId, setTeamId] = useState(teams[0]?.id ?? ""); const [phone, setPhone] = useState(""); const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !role || (role.includes("مدرب") && !teamId)) { setError("أدخل اسم الموظف وحدد الفريق للمدرب."); return; } onSave({ id: `staff-local-${Date.now()}`, name: name.trim(), initials: name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join(""), role, teamIds: teamId ? [teamId] : [], responsibilities: [role, phone ? `تواصل ${phone}` : "عضو ضمن الأكاديمية"], color: "mint", active: true }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">فريق الأكاديمية</span><h2>إضافة مدرب أو موظف</h2><p>يضاف السجل إلى بيانات العرض الحالية.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>الاسم الكامل *<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم"/></label><div className="form-two"><label>نوع الحساب<select value={role} onChange={(event) => setRole(event.target.value)}><option>مدرب</option><option>مدرب رئيسي</option><option>مدرب حراس</option><option>منسق إداري</option></select></label><label>الفريق<select value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">بدون فريق</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label></div><label>رقم التواصل<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="05xxxxxxxx"/></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">إضافة إلى الفريق</button></div></form></div>;
}

function ReportsPage({ role, players, onToast }: { role: DemoRole; players: DemoPlayer[]; onToast: (text: string) => void }) {
  const reports = ["تقرير تقدم اللاعب", "ملخص الحضور الشهري", "تقرير أداء الفريق", "تقييم نهاية الموسم"];
  const visibleReports = role === "parent" ? players.map((player) => ({ title: "تقرير تقدم اللاعب", playerName: player.name, index: 0 })) : reports.map((title, index) => ({ title, playerName: "", index }));
  return <><SectionTitle title="التقارير" subtitle={role === "parent" ? "تقارير اللاعبين المرتبطين بهذا الحساب التي نشرتها الأكاديمية." : "تقارير تساعدك على متابعة أداء اللاعبين والفرق."}/>{visibleReports.length ? <div className="report-grid">{visibleReports.map((report, key) => <article className="panel report-card" key={`${report.title}-${report.playerName || key}`}><span className={`report-art report-art-${report.index}`}><Icon name="report" size={25}/></span><div><h3>{report.title}</h3><p>{report.playerName ? `${report.playerName} · الفترة: أكتوبر – نوفمبر 2026` : "الفترة: أكتوبر – نوفمبر 2026"}</p></div><span className="report-ready">جاهز للعرض</span><button className="button button-ghost full-button" onClick={() => onToast(`فتح ${report.title}${report.playerName ? ` — ${report.playerName}` : ""}`)}>عرض التقرير <Icon name="arrow" size={15}/></button></article>)}</div> : <div className="panel schedule-empty">لا توجد تقارير منشورة للاعبين المرتبطين بهذا الحساب.</div>}</>;
}

function SettingsPage({ role, data, profile, onToast, onNavigate }: { role: DemoRole; data: DemoAcademyData; profile: DemoProfile; onToast: (text: string) => void; onNavigate: (key: NavKey) => void }) {
  const canManageOwnership = role === "owner";
  const [tab, setTab] = useState(canManageOwnership ? "academy" : "season");
  const [academyName, setAcademyName] = useState(data.academyName);
  const [email, setEmail] = useState("info@elite-academy.sa");
  const [phone, setPhone] = useState("+966 50 000 0000");
  const [address, setAddress] = useState("الرياض، المملكة العربية السعودية");
  const [season, setSeason] = useState(data.season);
  const [evaluationPeriod, setEvaluationPeriod] = useState("شهري");
  const [ratingScale, setRatingScale] = useState("1 إلى 5");
  const [parentAlert, setParentAlert] = useState(true);
  const menuItems = canManageOwnership ? [{ key: "academy", label: "بيانات الأكاديمية" }, { key: "branches", label: "الفروع" }, { key: "users", label: "المستخدمون" }, { key: "reports", label: "التقارير" }] : [{ key: "season", label: "الموسم النشط" }, { key: "assessments", label: "نماذج التقييم" }, { key: "notifications", label: "التنبيهات" }, { key: "schedule", label: "الجداول" }];
  const sectionTitle = menuItems.find((item) => item.key === tab)?.label ?? "الإعدادات";
  const saveSettings = () => onToast(canManageOwnership ? `تم حفظ إعدادات ${academyName} للعرض.` : `تم حفظ إعدادات ${sectionTitle} للعرض.`);
  return <>
    <SectionTitle title={canManageOwnership ? "إعدادات الأكاديمية" : "إعدادات التشغيل"} subtitle="الإعدادات المتاحة لهذا الدور في الأكاديمية."/>
    <div className="settings-layout"><div className="panel settings-menu">{menuItems.map((item) => <button type="button" key={item.key} className={tab === item.key ? "settings-active" : ""} onClick={() => setTab(item.key)}>{item.label}</button>)}</div><div className="panel settings-form"><div className="panel-heading"><div><h3>{sectionTitle}</h3><p>{canManageOwnership ? "المعلومات والإعدادات المتاحة لحساب المالك." : `إعدادات التشغيل المتاحة لـ ${profile.name}.`}</p></div><span className="settings-lock">إعدادات تجريبية</span></div>{canManageOwnership && tab === "academy" && <><label>اسم الأكاديمية<input value={academyName} onChange={(event) => setAcademyName(event.target.value)}/></label><div className="form-two"><label>البريد الإلكتروني<input type="email" value={email} onChange={(event) => setEmail(event.target.value)}/></label><label>رقم التواصل<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)}/></label></div><label>العنوان<input value={address} onChange={(event) => setAddress(event.target.value)}/></label><label>الموسم النشط<input value={season} onChange={(event) => setSeason(event.target.value)}/></label></>}{canManageOwnership && tab === "branches" && <div className="settings-branch-list">{data.branches.map((branch) => <div key={branch.id}><strong>{branch.name}</strong><span>{branch.city} · المدير: {branch.managerName || "غير معيّن"}</span></div>)}<button type="button" className="button button-outline" onClick={() => onNavigate("branches")}>فتح إدارة الفروع</button></div>}{canManageOwnership && tab === "users" && <div className="settings-branch-list"><p>{data.staff.length} مدرب وموظف في بيانات الأكاديمية.</p><button type="button" className="button button-outline" onClick={() => onNavigate("coaches")}>فتح المستخدمين والصلاحيات</button></div>}{canManageOwnership && tab === "reports" && <div className="settings-branch-list"><p>تقارير الأداء والحضور والتقييمات متاحة عبر صفحات المدير.</p><button type="button" className="button button-outline" onClick={() => onNavigate("reports")}>عرض التقارير</button></div>}{!canManageOwnership && tab === "season" && <label>الموسم النشط<input value={season} onChange={(event) => setSeason(event.target.value)}/></label>}{!canManageOwnership && tab === "assessments" && <><div className="form-two"><label>دورية التقييم<select value={evaluationPeriod} onChange={(event) => setEvaluationPeriod(event.target.value)}><option>أسبوعي</option><option>شهري</option><option>كل 6 أسابيع</option><option>نهاية الموسم</option></select></label><label>مقياس التقييم<select value={ratingScale} onChange={(event) => setRatingScale(event.target.value)}><option>1 إلى 5</option><option>1 إلى 10</option></select></label></div><p className="form-footnote">النموذج يستخدم حالياً مقياساً من 1 إلى 5.</p></>}{!canManageOwnership && tab === "notifications" && <label className="settings-toggle-row"><span><strong>تنبيه ولي الأمر عند تغيير موعد التدريب</strong><small>تفضيل عرض، ولا يرسل إشعاراً فعلياً.</small></span><input type="checkbox" checked={parentAlert} onChange={(event) => setParentAlert(event.target.checked)}/></label>}{!canManageOwnership && tab === "schedule" && <><div className="form-two"><label>بداية الدوام<input type="time" defaultValue="16:00"/></label><label>نهاية الدوام<input type="time" defaultValue="21:00"/></label></div><label>الملاعب المتاحة<input defaultValue="الملعب الرئيسي، الملعب الفرعي"/></label></>}{tab !== "branches" && tab !== "users" && tab !== "reports" && <div className="settings-bottom"><span>سيبقى التعديل ضمن النموذج التجريبي.</span><button type="button" className="button button-primary" onClick={saveSettings}>حفظ التغييرات</button></div>}</div></div>
  </>;
}

function PlatformUsersPage({ onToast }: { onToast: (text: string) => void }) {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState(demoProfiles);
  const [showInvite, setShowInvite] = useState(false);
  const visible = profiles.filter((profile) => profile.name.includes(query) || roleInfo[profile.role].title.includes(query));
  const scopeLabel = (profile: DemoProfile) => profile.role === "coach" ? `${profile.teamIds?.length ?? 0} فرق مسندة` : profile.role === "parent" || profile.role === "player" ? `${profile.playerIds?.length ?? 0} لاعب مرتبط` : profile.role === "platform_admin" ? "نطاق المنصة" : profile.role === "manager" ? "أكاديمية النخبة" : "جميع الفروع";
  return <><SectionTitle title="مستخدمو المنصة" subtitle="حسابات العرض ونطاق الوصول المسجل لكل دور." action="دعوة مستخدم" onAction={() => setShowInvite(true)}/><div className="filter-bar"><label className="search-field"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم المستخدم أو الدور..."/></label><span className="results-count">{visible.length} حساب</span></div><section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>المستخدم</th><th>الدور</th><th>النطاق</th><th>الحالة</th></tr></thead><tbody>{visible.map((person) => <tr key={person.id}><td><div className="player-cell"><Avatar initials={person.initials} color={person.color} small/><span><strong>{person.name}</strong><small>{person.email ?? person.title}</small></span></div></td><td>{roleInfo[person.role].title}</td><td>{scopeLabel(person)}</td><td><StatusPill>{person.id.startsWith("invite-") ? "دعوة تجريبية" : "تجريبي"}</StatusPill></td></tr>)}</tbody></table></div></section><div className="tip-banner"><span>✦</span><p>هذه الحسابات لتبديل واجهة العرض فقط. يجب تطبيق المصادقة الفعلية والصلاحيات على الخادم قبل الإطلاق.</p></div>{showInvite && <UserInviteModal onClose={() => setShowInvite(false)} onSave={(profile) => { setProfiles((current) => [profile, ...current]); setShowInvite(false); onToast(`تم تجهيز دعوة ${profile.name} للعرض فقط.`); }}/>}</>;
}

function UserInviteModal({ onClose, onSave }: { onClose: () => void; onSave: (profile: DemoProfile) => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [role, setRole] = useState<DemoRole>("manager"); const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !email.trim()) { setError("أكمل الاسم والبريد الإلكتروني."); return; } onSave({ id: `invite-${Date.now()}`, role, name: name.trim(), title: roleInfo[role].title, initials: name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join(""), color: roleInfo[role].color, email: email.trim() }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">إدارة المستخدمين</span><h2>دعوة مستخدم</h2><p>إنشاء دعوة شكلية مرتبطة بدور ونطاق.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم المستخدم *<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم الكامل"/></label><label>البريد الإلكتروني *<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com"/></label><div className="form-two"><label>الدور<select value={role} onChange={(event) => setRole(event.target.value as DemoRole)}>{(["manager", "coach", "parent", "player"] as DemoRole[]).map((item) => <option value={item} key={item}>{roleInfo[item].title}</option>)}</select></label><label>نطاق الأكاديمية<input value="أكاديمية النخبة" readOnly/></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">تجهيز الدعوة</button></div></form></div>;
}

function PlatformSettingsPage({ onToast }: { onToast: (text: string) => void }) {
  const [tab, setTab] = useState("general"); const [language, setLanguage] = useState("العربية"); const [inviteDuration, setInviteDuration] = useState("7 أيام"); const [supportEmail, setSupportEmail] = useState("support@nokhba.sa"); const [maintenanceNotice, setMaintenanceNotice] = useState(false);
  const tabs = [{ id: "general", label: "الإعدادات العامة" }, { id: "languages", label: "اللغات" }, { id: "invites", label: "الدعوات" }, { id: "support", label: "الدعم" }];
  const title = tabs.find((item) => item.id === tab)?.label ?? "الإعدادات";
  return <><SectionTitle title="إعدادات المنصة" subtitle="إعدادات عامة لا تتبع أكاديمية بعينها."/><div className="settings-layout"><div className="panel settings-menu">{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "settings-active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</div><div className="panel settings-form"><div className="panel-heading"><div><h3>{title}</h3><p>تغييرات محلية للعرض ولا تصل إلى خادم.</p></div><span className="settings-lock">إعدادات تجريبية</span></div>{tab === "general" && <><label>اللغة الافتراضية<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>العربية</option><option>العربية والإنجليزية</option></select></label><div className="settings-toggle-row"><span><strong>عزل بيانات الأكاديميات</strong><small>قاعدة ثابتة للتصميم، لا يمكن تعطيلها من الواجهة.</small></span><StatusPill>مفعل</StatusPill></div></>}{tab === "languages" && <><label>لغة المنصة<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>العربية</option><option>العربية والإنجليزية</option></select></label><p className="form-footnote">الواجهات الحالية باللغة العربية وبتخطيط من اليمين إلى اليسار.</p></>}{tab === "invites" && <><label>مدة صلاحية الدعوة<input value={inviteDuration} onChange={(event) => setInviteDuration(event.target.value)}/></label><p className="form-footnote">القيمة تعرض كنموذج فقط، ولا ترسل دعوات حقيقية.</p></>}{tab === "support" && <><label>بريد الدعم<input type="email" value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)}/></label><label className="settings-toggle-row"><span><strong>إظهار تنبيه الصيانة</strong><small>يغيّر حالة العرض في النموذج.</small></span><input type="checkbox" checked={maintenanceNotice} onChange={(event) => setMaintenanceNotice(event.target.checked)}/></label></>}<div className="settings-bottom"><span>سيبقى التعديل ضمن النموذج التجريبي.</span><button type="button" className="button button-primary" onClick={() => onToast(`تم حفظ ${title} للعرض.`)}>حفظ التغييرات</button></div></div></div></>;
}

function AcademyTable({ academies, onOpen }: { academies: DemoPlatformAcademy[]; onOpen: () => void }) {
  return <section className="panel academy-table-panel"><div className="panel-heading"><div><h3>الأكاديميات</h3><p>{academies.length} مساحات ضمن بيانات العرض</p></div><button className="text-link" onClick={onOpen}>عرض الكل <Icon name="arrow" size={14}/></button></div><div className="table-wrap"><table><thead><tr><th>الأكاديمية</th><th>المالك</th><th>الموقع</th><th>اللاعبون</th><th>الحالة</th><th>آخر نشاط</th></tr></thead><tbody>{academies.map((academy) => <tr key={academy.id}><td><div className="academy-name"><span>ن</span><strong>{academy.name}</strong></div></td><td><span className="academy-owner-cell"><strong>{academy.ownerName ?? "غير محدد"}</strong><small>{academy.ownerEmail ?? ""}</small></span></td><td>{academy.city}</td><td>{academy.players}</td><td><StatusPill tone={academy.status === "نشطة" ? "green" : "orange"}>{academy.status}</StatusPill></td><td>{academy.lastActivity}</td></tr>)}</tbody></table></div></section>;
}

function PlatformAcademies({ data, onToast, onCreate }: { data: DemoPlatformData; onToast: (text: string) => void; onCreate: (academy: DemoPlatformAcademy) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const visible = data.academies.filter((academy) => academy.name.includes(query) && (status === "الكل" || academy.status === status));
  return <><SectionTitle title="الأكاديميات" subtitle={`إدارة مساحات الأكاديميات وحالة تفعيلها · ${data.academies.length} أكاديميات تجريبية.`} action="إضافة أكاديمية" onAction={() => setShowForm(true)}/><div className="filter-bar"><label className="search-field"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الأكاديمية..."/></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>الكل</option><option>نشطة</option><option>بانتظار التفعيل</option></select><span className="results-count">{visible.length} أكاديمية</span></div><section className="panel"><AcademyTable academies={visible} onOpen={() => onToast("أنت تعرض كل الأكاديميات التجريبية")}/></section>{showForm && <AcademyModal onClose={() => setShowForm(false)} onSave={(academy) => { onCreate(academy); setShowForm(false); setQuery(academy.name); setStatus("الكل"); }}/>}</>;
}

function AcademyModal({ onClose, onSave }: { onClose: () => void; onSave: (academy: DemoPlatformAcademy) => void }) {
  const [name, setName] = useState(""); const [city, setCity] = useState(""); const [owner, setOwner] = useState(""); const [email, setEmail] = useState(""); const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !city.trim() || !owner.trim() || !email.trim()) { setError("أكمل بيانات الأكاديمية والمالك."); return; } onSave({ id: `academy-local-${Date.now()}`, name: name.trim(), city: city.trim(), ownerName: owner.trim(), ownerEmail: email.trim(), players: 0, activeUsers: 1, status: "بانتظار التفعيل", lastActivity: "اليوم" }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">مساحات المنصة</span><h2>إضافة أكاديمية</h2><p>تبدأ الأكاديمية الجديدة بانتظار التفعيل.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم الأكاديمية *<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم الأكاديمية"/></label><div className="form-two"><label>المدينة *<input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="المدينة"/></label><label>اسم المالك *<input required value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="اسم المالك"/></label></div><label>بريد المالك *<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@example.com"/></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">إنشاء الأكاديمية</button></div></form></div>;
}

type DemoAchievement = { id: string; title: string; description: string; date: string; status: "موثق" | "بانتظار المراجعة" };

function AchievementsPage({ playerName, teamName, onToast }: { playerName: string; teamName: string; onToast: (text: string) => void }) {
  const [items, setItems] = useState<DemoAchievement[]>([
    { id: "ach-1", title: "أفضل لاعب في التدريب", description: "أداء مميز في التمرين الأسبوعي.", date: "2026-10-28", status: "موثق" },
    { id: "ach-2", title: "تطور ملحوظ هذا الشهر", description: "تحسن واضح في الالتزام بالتدريب.", date: "2026-10-21", status: "موثق" },
    { id: "ach-3", title: "المشاركة في المباراة الودية", description: "مشاركة فعالة مع الفريق.", date: "2026-10-14", status: "بانتظار المراجعة" },
  ]);
  const [showForm, setShowForm] = useState(false);
  return <><SectionTitle title="إنجازاتي" subtitle="إنجازاتك الرياضية واللحظات التي تفخر بها." action="إضافة إنجاز" onAction={() => setShowForm(true)}/><div className="achievement-grid">{items.map((item, index) => <div className="panel achievement-card" key={item.id}><span className={`achievement-icon ach-${index % 3}`}>✦</span><small>{formatArabicDate(item.date)}</small><h3>{item.title}</h3><p>{item.description} · {teamName}</p><StatusPill tone={item.status === "موثق" ? "green" : "orange"}>{item.status}</StatusPill></div>)}</div>{showForm && <AchievementModal onClose={() => setShowForm(false)} onSave={(item) => { setItems((current) => [item, ...current]); setShowForm(false); onToast(`تم إرسال إنجازك للمراجعة باسم ${playerName}.`); }}/>}</>;
}

function AchievementModal({ onClose, onSave }: { onClose: () => void; onSave: (item: DemoAchievement) => void }) {
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [date, setDate] = useState("2026-11-08"); const [error, setError] = useState("");
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const read = (key: string, fallback: string) => { const value = form.get(key); return value === null ? fallback : String(value); }; const submittedTitle = read("title", title).trim(); const submittedDescription = read("description", description).trim(); const submittedDate = read("date", date); if (!submittedTitle || !submittedDescription || !submittedDate || Number.isNaN(new Date(`${submittedDate}T12:00:00`).getTime())) { setError("أكمل اسم الإنجاز ووصفه وتاريخه."); return; } onSave({ id: `ach-local-${Date.now()}`, title: submittedTitle, description: submittedDescription, date: submittedDate, status: "بانتظار المراجعة" }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">سجلك الرياضي</span><h2>إضافة إنجاز</h2><p>سيظهر الإنجاز بانتظار مراجعة الأكاديمية.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم الإنجاز *<input name="title" autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: أول هدف في مباراة"/></label><label>التفاصيل *<textarea name="description" required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="اكتب وصفاً مختصراً للإنجاز"/></label><label>التاريخ *<input name="date" type="date" required value={date} onChange={(event) => setDate(event.target.value)}/></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">إرسال للمراجعة</button></div></form></div>;
}

function ageFromBirthDate(value: string) {
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function Modal({ teams, onClose, onSave }: { teams: DemoTeam[]; onClose: () => void; onSave: (player: NewDemoPlayer) => Promise<void> }) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2013-01-01");
  const [position, setPosition] = useState("وسط");
  const [preferredFoot, setPreferredFoot] = useState<DemoPlayer["preferredFoot"]>("يمين");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string, fallback: string) => { const value = form.get(key); return value === null ? fallback : String(value); };
    const submittedName = read("playerName", name).trim();
    const submittedBirthDate = read("birthDate", birthDate);
    const submittedPosition = read("position", position).trim();
    const submittedFoot = read("preferredFoot", preferredFoot) as DemoPlayer["preferredFoot"];
    const submittedTeamId = read("teamId", teamId);
    const submittedGuardianName = read("guardianName", guardianName).trim();
    const submittedGuardianPhone = read("guardianPhone", guardianPhone).trim();
    const age = ageFromBirthDate(submittedBirthDate);
    const selectedTeam = teams.find((team) => team.id === submittedTeamId);
    const birthYear = Number(submittedBirthDate.slice(0, 4));
    const teamYears = selectedTeam?.ageGroup.match(/20\d{2}/g)?.map(Number) ?? [];
    if (!submittedName || !submittedGuardianName || !submittedGuardianPhone || !submittedTeamId) return;
    if (age < 5 || age > 20) { setError("العمر المدخل خارج النطاق التجريبي (5 إلى 20 سنة)."); return; }
    if (teamYears.length && (birthYear < Math.min(...teamYears) || birthYear > Math.max(...teamYears))) { setError("تاريخ الميلاد لا يطابق الفئة العمرية للفريق المحدد."); return; }
    setError("");
    try {
      await onSave({ name: submittedName, initials: submittedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join(""), age, birthDate: submittedBirthDate, position: submittedPosition, preferredFoot: submittedFoot, teamId: submittedTeamId, guardianName: submittedGuardianName, guardianPhone: submittedGuardianPhone, attendance: 0, rating: 0, lastAssessedAt: null, ratings: { technical: 0, tactical: 0, physical: 0, mental: 0 }, enrollmentStatus: "غير مكتمل", needsFollowUp: false, color: "mint" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إنشاء ملف اللاعب.");
    }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">تسجيل داخلي</span><h2>إضافة لاعب جديد</h2><p>ينشأ ملف اللاعب من داخل الأكاديمية.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم اللاعب *<input name="playerName" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل"/></label><div className="form-two"><label>تاريخ الميلاد *<input name="birthDate" type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)}/><small>العمر المحسوب: {ageFromBirthDate(birthDate)} سنة</small></label><label>المركز<input name="position" required value={position} onChange={(e) => setPosition(e.target.value)}/></label></div><div className="form-two"><label>القدم المفضلة<select name="preferredFoot" value={preferredFoot} onChange={(e) => setPreferredFoot(e.target.value as DemoPlayer["preferredFoot"])}><option>يمين</option><option>يسار</option><option>كلتا القدمين</option></select></label><label>الفريق<select name="teamId" value={teamId} onChange={(e) => setTeamId(e.target.value)}>{teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label></div><div className="form-two"><label>اسم ولي الأمر *<input name="guardianName" required value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="الاسم الكامل"/></label><label>رقم التواصل *<input name="guardianPhone" required type="tel" pattern="(05[0-9]{8}|\+9665[0-9]{8})" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="05xxxxxxxx أو +9665xxxxxxxx"/></label></div><div className="invite-parent-note"><span>♡</span><p>يُحفظ الملف بحالة «غير مكتمل». إرسال الدعوات وتفعيل الربط غير متاحين في النموذج الأولي.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">حفظ ملف اللاعب</button></div></form></div>;
}

function PlayerDetail({ player, teams, showGuardian, onClose }: { player: DemoPlayer; teams: DemoTeam[]; showGuardian: boolean; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card detail-modal"><div className="detail-cover"><button className="icon-button" onClick={onClose}><Icon name="close"/></button><Avatar initials={player.initials} color={player.color}/></div><div className="detail-profile"><div><h2>{player.name}</h2><p>{player.age} سنة · {player.position} · {teamLabel(teams, player.teamId)}</p></div><StatusPill tone={player.enrollmentStatus === "نشط" ? "green" : "orange"}>{player.enrollmentStatus}</StatusPill></div><div className="detail-stats"><div><small>الحضور</small><strong>{player.attendance}%</strong></div><div><small>التقييم العام</small><strong>{player.rating > 0 ? `★ ${player.rating.toFixed(1)}` : "لم يقيّم"}</strong></div><div><small>القدم المفضلة</small><strong>{player.preferredFoot}</strong></div></div>{showGuardian && <><h3 className="detail-subtitle">بيانات ولي الأمر</h3><p className="detail-note">{player.guardianName} · {player.guardianPhone}</p></>}<button className="button button-primary full-button" onClick={onClose}>تم</button></section></div>;
}

function BranchesPage({ data, onAdd, onSelect }: { data: DemoAcademyData; onAdd: () => void; onSelect: (branchId: string) => void }) {
  return <><SectionTitle title="فروع الأكاديمية" subtitle="أدر مواقع الأكاديمية وراجع الفرق واللاعبين في كل فرع." action="إضافة فرع" onAction={onAdd}/><div className="branch-overview"><div><strong>{data.branches.length}</strong><span>فروع</span></div><div><strong>{data.players.filter((player) => player.enrollmentStatus === "نشط").length}</strong><span>لاعب نشط</span></div><div><strong>{data.staff.filter((person) => person.active).length}</strong><span>مدرب وموظف</span></div></div><div className="branch-grid">{data.branches.map((branch) => { const teams = data.teams.filter((team) => team.branchId === branch.id); const teamIds = new Set(teams.map((team) => team.id)); const playerCount = data.players.filter((player) => teamIds.has(player.teamId) && player.enrollmentStatus === "نشط").length; const coachCount = data.staff.filter((person) => person.active && person.teamIds.some((id) => teamIds.has(id))).length; return <article className="panel branch-card" key={branch.id}><div className="branch-card-top"><span className="branch-mark">ن</span><StatusPill>{branch.active ? "نشط" : "موقوف"}</StatusPill></div><span className="eyebrow">{branch.city}</span><h3>{branch.name}</h3><p>مدير الفرع: {branch.managerName || "لم يعيّن بعد"}</p><div className="branch-metrics"><span><strong>{playerCount}</strong> لاعب</span><span><strong>{teams.length}</strong> فرق</span><span><strong>{coachCount}</strong> مدرب</span></div><button className="button button-ghost full-button" onClick={() => onSelect(branch.id)}>إدارة هذا الفرع <Icon name="arrow" size={15}/></button></article>; })}</div><div className="tip-banner"><span>✦</span><p>المالك يدير الفروع ويختار نطاق العرض. مدير الأكاديمية يرى بيانات أكاديميته كاملة، ولا يصل إلى أكاديميات أخرى.</p></div></>;
}

function BranchModal({ onClose, onSave }: { onClose: () => void; onSave: (branch: DemoBranch) => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [managerName, setManagerName] = useState("");
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !city.trim()) { setError("أدخل اسم الفرع والمدينة."); return; } onSave({ id: `b-local-${Date.now()}`, name: name.trim(), city: city.trim(), managerName: managerName.trim(), active: true }); };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">إدارة الفروع</span><h2>إضافة فرع جديد</h2><p>سيظهر الفرع للمالك ويمكن إسناد مدير له.</p></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div><label>اسم الفرع *<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: فرع الخبر"/></label><div className="form-two"><label>المدينة *<input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="المدينة"/></label><label>مدير الفرع<input value={managerName} onChange={(event) => setManagerName(event.target.value)} placeholder="اختياري"/></label></div><div className="invite-parent-note"><span>✓</span><p>تمثيل بصري فقط؛ الفرع الجديد يبدأ دون فرق أو لاعبين، ويمكن إكمال بياناته من صفحات الإدارة.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>إلغاء</button><button type="submit" className="button button-primary">إنشاء الفرع</button></div></form></div>;
}

function Workspace({ role, onLogout }: { role: DemoRole; onLogout: () => void }) {
  const [data, setData] = useState<DemoAcademyData | null>(null);
  const [platformData, setPlatformData] = useState<DemoPlatformData | null>(null);
  const [activePage, setActivePage] = useState<NavKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<DemoPlayer | null>(null);
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profile = getDemoProfile(role)!;
  const nav = navByRole[role];

  useEffect(() => { Promise.all([academyRepository.getAcademyData(), platformRepository.getPlatformData()]).then(([academy, platform]) => { setData(academy); setPlatformData(platform); }); }, []);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 3000); return () => window.clearTimeout(timer); }, [toast]);

  const title = useMemo(() => nav.find((item) => item.key === activePage)?.label ?? "نظرة عامة", [nav, activePage]);
  if (!data || !platformData) return <div className="loading-screen"><Brand/><span className="loading-spinner"/>جارٍ تجهيز مساحة الأكاديمية…</div>;

  const assignedPlayerIds = new Set(profile.playerIds ?? []);
  const assignedTeamIds = new Set(profile.teamIds ?? []);
  const visibleBranchIds = role === "owner" && selectedBranchId !== "all"
    ? new Set([selectedBranchId])
    : new Set(data.branches.map((branch) => branch.id));
  const branchTeams = data.teams.filter((team) => visibleBranchIds.has(team.branchId));
  const branchTeamIds = new Set(branchTeams.map((team) => team.id));
  const branchScopedData: DemoAcademyData = {
    ...data,
    branches: data.branches.filter((branch) => visibleBranchIds.has(branch.id)),
    teams: branchTeams,
    players: data.players.filter((player) => branchTeamIds.has(player.teamId)),
    staff: data.staff.filter((person) => person.teamIds.length === 0 ? role === "owner" || role === "manager" : person.teamIds.some((id) => branchTeamIds.has(id))),
    sessions: data.sessions.filter((session) => branchTeamIds.has(session.teamId)),
    goals: data.goals.filter((goal) => data.players.some((player) => player.id === goal.playerId && branchTeamIds.has(player.teamId))),
  };
  const linkedTeamIds = role === "parent" || role === "player"
    ? new Set(data.players.filter((player) => assignedPlayerIds.has(player.id)).map((player) => player.teamId))
    : assignedTeamIds;
  const scopedData = role === "parent" || role === "player"
    ? { ...data, players: data.players.filter((player) => assignedPlayerIds.has(player.id)), teams: data.teams.filter((team) => linkedTeamIds.has(team.id)), sessions: data.sessions.filter((session) => linkedTeamIds.has(session.teamId)), goals: data.goals.filter((goal) => assignedPlayerIds.has(goal.playerId)) }
    : role === "coach"
      ? { ...data, players: data.players.filter((player) => assignedTeamIds.has(player.teamId)), teams: data.teams.filter((team) => assignedTeamIds.has(team.id)), sessions: data.sessions.filter((session) => assignedTeamIds.has(session.teamId)), goals: data.goals.filter((goal) => data.players.some((player) => player.id === goal.playerId && assignedTeamIds.has(player.teamId))) }
      : role === "owner" || role === "manager" ? branchScopedData : data;
  const notificationItems = role === "platform_admin"
    ? ["نادي الموهبة بانتظار التفعيل.", `${platformData.academies.length} مساحات أكاديمية في بيانات العرض.`]
    : role === "parent" || role === "player"
      ? [scopedData.goals[0] ? `موعد مراجعة هدفك: ${scopedData.goals[0].due}.` : "لا توجد تحديثات جديدة على خطة التطوير.", `حضور هذا الموسم ${scopedData.players[0]?.attendance ?? 0}%.`]
      : role === "owner"
        ? ["ملخص الأكاديمية متاح من صفحة التقارير.", `يوجد ${scopedData.staff.length} مستخدمين ضمن بيانات الأكاديمية.`]
        : [`${scopedData.players.filter((player) => player.needsFollowUp).length} لاعب بحاجة إلى متابعة.`, `${scopedData.players.filter((player) => player.enrollmentStatus !== "نشط").length} ملفات تسجيل غير مكتملة.`];

  const renderPage = () => {
    if (activePage === "overview") return <DashboardOverview role={role} data={scopedData} platformData={platformData} onNavigate={setActivePage}/>;
    if (activePage === "players") return role === "player" ? <AssessmentsPage data={scopedData} role={role} onToast={setToast} onSave={(playerId, ratings) => { const rating = meanRating(ratings); setData((current) => current ? { ...current, players: current.players.map((player) => player.id === playerId ? { ...player, ratings, rating, lastAssessedAt: new Date().toISOString().slice(0, 10) } : player) } : current); setToast("تم تحديث التقييم في بيانات العرض."); }}/> : <PlayerPage players={scopedData.players} teams={scopedData.teams} onAdd={() => setModalOpen(true)} onSelect={setSelectedPlayer} canAdd={role === "manager" || role === "owner"}/>;
    if (activePage === "branches") return <BranchesPage data={data} onAdd={() => setBranchModalOpen(true)} onSelect={(branchId) => { setSelectedBranchId(branchId); setActivePage("overview"); }}/>;
    if (activePage === "teams") return <TeamsPage data={scopedData} role={role} availableStaff={role === "owner" ? data.staff : scopedData.staff} onToast={setToast} onCreate={(team) => { setData((current) => current ? { ...current, teams: [...current.teams, team], staff: current.staff.map((person) => person.id === team.coachId ? { ...person, teamIds: Array.from(new Set([...person.teamIds, team.id])) } : person) } : current); setToast(`تم إنشاء ${team.name} في النموذج التجريبي.`); }}/>
    if (activePage === "coaches") return <CoachesPage staff={scopedData.staff} teams={scopedData.teams} onToast={setToast} onInvite={(person) => { setData((current) => current ? { ...current, staff: [...current.staff, person] } : current); setToast(`تمت إضافة ${person.name} إلى سجل العرض.`); }}/>;
    if (activePage === "users") return <PlatformUsersPage onToast={setToast}/>;
    if (activePage === "schedule") return <SchedulePage sessions={scopedData.sessions} teams={scopedData.teams} canManage={role === "manager" || role === "owner"} onToast={setToast} onCreate={(session) => { setData((current) => current ? { ...current, sessions: [session, ...current.sessions] } : current); setToast("تمت إضافة الموعد إلى الجدول التجريبي."); }}/>;
    if (activePage === "attendance") { const session = scopedData.sessions[0]; if (!session) return <div className="panel schedule-empty">لا توجد جلسة متاحة لعرض حضورها.</div>; return <AttendancePage key={session.id} players={scopedData.players.filter((player) => player.teamId === session.teamId)} session={session} teams={scopedData.teams} readOnly={role === "parent"} onSaveAttendance={async (records) => { try { await academyRepository.saveAttendance(session.id, records); setToast("تم حفظ الحضور في مخزن العرض المؤقت"); } catch { setToast("تعذر حفظ الحضور التجريبي"); } }}/>; }
    if (activePage === "assessments" || activePage === "progress") return <AssessmentsPage data={scopedData} role={role} onToast={setToast} onSave={(playerId, ratings) => { const rating = meanRating(ratings); setData((current) => current ? { ...current, players: current.players.map((player) => player.id === playerId ? { ...player, ratings, rating, lastAssessedAt: new Date().toISOString().slice(0, 10) } : player) } : current); setToast("تم تحديث التقييم في بيانات العرض."); }}/>
    if (activePage === "development") return <DevelopmentPage goals={scopedData.goals} players={scopedData.players} role={role} onToast={setToast} onCreate={(goal) => { setData((current) => current ? { ...current, goals: [goal, ...current.goals] } : current); setToast("تمت إضافة هدف التطوير التجريبي."); }} onUpdate={(goalId, progress) => { setData((current) => current ? { ...current, goals: current.goals.map((goal) => goal.id === goalId ? { ...goal, progress, state: progress >= 100 ? "مكتمل" : goal.state } : goal) } : current); setToast(`تم تحديث تقدم الخطة إلى ${progress}٪.`); }}/>
    if (activePage === "reports") return <ReportsPage role={role} players={scopedData.players} onToast={setToast}/>;
    if (activePage === "settings") return role === "platform_admin" ? <PlatformSettingsPage onToast={setToast}/> : <SettingsPage role={role} data={scopedData} profile={profile} onToast={setToast} onNavigate={setActivePage}/>;
    if (activePage === "academies") return <PlatformAcademies data={platformData} onToast={setToast} onCreate={(academy) => setPlatformData((current) => current ? { ...current, academies: [academy, ...current.academies] } : current)}/>;
    if (activePage === "activity") return <><SectionTitle title="سجل النشاط" subtitle="عمليات حديثة في مساحة المنصة."/><div className="panel activity-log">{["تم تفعيل أكاديمية المستقبل", "تمت دعوة مدربة جديدة إلى أكاديمية النخبة", "تم تحديث بيانات موسم " + data.season, "تم إرسال تقرير تقدم إلى ولي أمر"].map((item, i) => <div className="log-item" key={item}><span className="log-icon">{i + 1}</span><span><strong>{item}</strong><small>منذ {i * 2 + 8} دقائق · بواسطة مدير النظام</small></span><StatusPill>مكتمل</StatusPill></div>)}</div></>;
    if (activePage === "achievements") return <AchievementsPage playerName={scopedData.players[0]?.name ?? profile.name} teamName={scopedData.teams[0]?.name ?? "الفريق"} onToast={setToast}/>;
    return <DashboardOverview role={role} data={scopedData} platformData={platformData} onNavigate={setActivePage}/>;
  };

  const handleAddPlayer = async (input: NewDemoPlayer) => { const player = await academyRepository.createPlayer(input); setData((current) => current ? { ...current, players: [player, ...current.players] } : current); setModalOpen(false); setToast("تم إنشاء ملف اللاعب التجريبي بحالة غير مكتمل؛ الدعوة غير مفعلة."); };
  const handleAddBranch = (branch: DemoBranch) => { setData((current) => current ? { ...current, branches: [...current.branches, branch] } : current); setSelectedBranchId(branch.id); setBranchModalOpen(false); setToast(`تمت إضافة ${branch.name} إلى النموذج التجريبي.`); };

  const activeBranchName = data.branches.find((branch) => branch.id === selectedBranchId)?.name;
  const currentBranchName = role === "manager" ? data.academyName : activeBranchName;
  return <div className={`app-shell ${sidebarCollapsed ? "shell-collapsed" : ""}`}>
    <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand-row"><Brand/><button className="sidebar-collapse-button icon-button" title={sidebarCollapsed ? "توسيع القائمة" : "طي القائمة"} aria-label={sidebarCollapsed ? "توسيع القائمة" : "طي القائمة"} onClick={() => setSidebarCollapsed((value) => !value)}><Icon name="menu"/></button><button className="mobile-close icon-button" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}><Icon name="close"/></button></div>
      <div className="academy-switcher"><span className="academy-mini-mark">ن</span>{role === "owner" ? <label className="branch-selector"><strong>أكاديمية النخبة</strong><select aria-label="اختيار الفرع" value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}><option value="all">كل الفروع</option>{data.branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label> : <span><strong>{role === "platform_admin" ? "إدارة المنصة" : role === "manager" ? currentBranchName ?? "أكاديمية النخبة" : "أكاديمية النخبة"}</strong><small>{role === "platform_admin" ? "مساحة مدير النظام" : data.season}</small></span>}</div>
      <div className="nav-label">القائمة الرئيسية</div>
      <nav className="side-nav">{nav.map((item) => <button key={item.key} className={`nav-item ${activePage === item.key ? "nav-active" : ""}`} title={sidebarCollapsed ? item.label : undefined} aria-label={item.label} onClick={() => { setActivePage(item.key); setMobileOpen(false); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav>
      {role !== "platform_admin" && <div className="sidebar-help"><span className="help-spark">✦</span><strong>هل تحتاج مساعدة؟</strong><p>فريقنا هنا لمساعدتك في إدارة الأكاديمية.</p><button onClick={() => setToast("تم فتح مركز المساعدة التجريبي")}>مركز المساعدة <Icon name="arrow" size={14}/></button></div>}
      <button className="sidebar-profile" onClick={onLogout}><Avatar initials={profile.initials} color={profile.color} small/><span><strong>{profile.name}</strong><small>{profile.title}</small></span><span className="profile-menu">⌄</span></button>
    </aside>
    {mobileOpen && <button className="mobile-backdrop" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}/>}
    <div className="main-column">
      <header className="topbar"><div className="topbar-start"><button className="mobile-menu icon-button" aria-label="فتح القائمة" onClick={() => setMobileOpen(true)}><Icon name="menu"/></button><div className="breadcrumb"><span>{role === "platform_admin" ? "إدارة النظام" : role === "owner" && currentBranchName ? currentBranchName : currentBranchName ?? "أكاديمية النخبة"}</span><b>/</b><strong>{title}</strong></div></div><div className="topbar-actions"><button className="sidebar-collapse-top icon-button" title={sidebarCollapsed ? "توسيع القائمة" : "طي القائمة"} aria-label={sidebarCollapsed ? "توسيع القائمة" : "طي القائمة"} onClick={() => setSidebarCollapsed((value) => !value)}><Icon name="menu"/></button><span className="topbar-separator"/><div className="notification-wrap"><button className="icon-button notification-button" aria-label="الإشعارات" onClick={() => setNotificationsOpen((v) => !v)}><Icon name="bell" size={19}/><i/></button>{notificationsOpen && <div className="notification-popover"><strong>الإشعارات</strong>{notificationItems.map((item) => <p key={item}>{item}</p>)}<button onClick={() => setNotificationsOpen(false)}>إغلاق</button></div>}</div><button className="topbar-user" onClick={onLogout}><Avatar initials={profile.initials} color={profile.color} small/><span><strong>{profile.name}</strong><small>{profile.title}</small></span><span className="profile-menu">⌄</span></button></div></header>
      <main className="page-content"><div className="demo-ribbon"><span className="demo-ribbon-dot"/> نموذج أولي · البيانات تجريبية ومؤقتة <button onClick={onLogout}>تغيير الدور</button></div>{renderPage()}</main>
      <footer className="app-footer"><span>© 2026 نخبة — منصة إدارة الأكاديميات</span><span>الإصدار التجريبي 0.1</span></footer>
    </div>
    {modalOpen && <Modal teams={scopedData.teams} onClose={() => setModalOpen(false)} onSave={handleAddPlayer}/>}
    {branchModalOpen && <BranchModal onClose={() => setBranchModalOpen(false)} onSave={handleAddBranch}/>}
    {selectedPlayer && <PlayerDetail player={selectedPlayer} teams={scopedData.teams} showGuardian={role !== "coach"} onClose={() => setSelectedPlayer(null)}/>}
    {toast && <div className="toast-message"><span>✓</span>{toast}</div>}
  </div>;
}

export default function Home() {
  const [role, setRole] = useState<DemoRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(DEMO_SESSION_KEY) as DemoRole | null;
    if (saved && roleOptions.includes(saved)) setRole(saved);
    setReady(true);
  }, []);

  const login = (nextRole: DemoRole) => { window.sessionStorage.setItem(DEMO_SESSION_KEY, nextRole); setRole(nextRole); };
  const logout = () => { window.sessionStorage.removeItem(DEMO_SESSION_KEY); setRole(null); };

  if (!ready) return <div className="loading-screen"><Brand/><span className="loading-spinner"/>جارٍ التحميل…</div>;
  return role ? <Workspace role={role} onLogout={logout}/> : <LoginScreen onLogin={login}/>;
}
