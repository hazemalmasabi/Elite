import type { DemoProfile, DemoRole } from "@/data/models";

/** UI-only role switching. This is deliberately not real authentication or authorization. */
export const DEMO_SESSION_KEY = "elite-academy-prototype-role";

export const demoProfiles: DemoProfile[] = [
  { id: "demo-platform", role: "platform_admin", name: "سارة المنصور", title: "مديرة المنصة", initials: "سم", color: "lavender" },
  { id: "demo-owner", role: "owner", name: "خالد العتيبي", title: "مالك الأكاديمية", initials: "خع", color: "mint" },
  { id: "demo-manager", role: "manager", name: "نورة الشمري", title: "مديرة الأكاديمية", initials: "نش", color: "peach" },
  { id: "demo-coach", role: "coach", name: "فهد السبيعي", title: "مدرب فريق البراعم A", initials: "فس", color: "sky", teamIds: ["t-1"] },
  { id: "demo-parent", role: "parent", name: "عبدالرحمن العتيبي", title: "ولي أمر يوسف", initials: "عا", color: "lemon", playerIds: ["p-101"] },
  { id: "demo-player", role: "player", name: "يوسف العتيبي", title: "لاعب — فريق البراعم A", initials: "يع", color: "rose", playerIds: ["p-101"] },
];

export function getDemoProfile(role: DemoRole) {
  return demoProfiles.find((profile) => profile.role === role);
}
