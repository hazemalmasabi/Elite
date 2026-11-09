import type { DemoPlatformData, PlatformRepository } from "@/data/models";

/** Cross-academy demo fixture; kept outside the tenant-scoped academy repository. */
const platformData: DemoPlatformData = {
  academies: [
    { id: "a-1", name: "أكاديمية النخبة", city: "الرياض", ownerName: "خالد العتيبي", ownerEmail: "info@elite-academy.sa", players: 23, activeUsers: 56, status: "نشطة", lastActivity: "08 نوفمبر 2026" },
    { id: "a-2", name: "أكاديمية المستقبل", city: "جدة", ownerName: "عبدالعزيز الحربي", ownerEmail: "hello@future-academy.sa", players: 186, activeUsers: 34, status: "نشطة", lastActivity: "07 نوفمبر 2026" },
    { id: "a-3", name: "نادي الموهبة", city: "الدمام", ownerName: "فهد القحطاني", ownerEmail: "info@talent-club.sa", players: 142, activeUsers: 28, status: "بانتظار التفعيل", lastActivity: "06 نوفمبر 2026" },
    { id: "a-4", name: "أكاديمية الأبطال", city: "مكة المكرمة", ownerName: "سلمان الغامدي", ownerEmail: "admin@champions.sa", players: 96, activeUsers: 19, status: "نشطة", lastActivity: "05 نوفمبر 2026" },
  ],
  weeklyActiveUsers: [43, 60, 51, 73, 62, 87, 75, 94, 71, 83, 100, 89],
};

export const mockPlatformRepository: PlatformRepository = {
  async getPlatformData() {
    return structuredClone(platformData);
  },
};
