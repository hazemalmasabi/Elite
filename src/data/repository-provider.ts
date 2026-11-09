import { mockRepository } from "@/data/mock/mock-repository";
import { mockPlatformRepository } from "@/data/mock/mock-platform-repository";
import type { AcademyRepository, PlatformRepository } from "@/data/models";

/** Swap each provider independently for its API/database-backed adapter. */
export const academyRepository: AcademyRepository = mockRepository;
export const platformRepository: PlatformRepository = mockPlatformRepository;
