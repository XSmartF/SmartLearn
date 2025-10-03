import { useEffect, useState } from "react";
import { userRepository } from "@/shared/lib/repositories/UserRepository";
import type { LibraryMeta } from "@/shared/lib/models";

export interface DashboardOwnerProfile {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export function useOwnerProfiles(libraries: LibraryMeta[]): Record<string, DashboardOwnerProfile> {
  const [profiles, setProfiles] = useState<Record<string, DashboardOwnerProfile>>({});

  useEffect(() => {
    const missingOwners = libraries
      .map((library) => library.ownerId)
      .filter((ownerId): ownerId is string => Boolean(ownerId) && !profiles[ownerId]);

    if (missingOwners.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      const uniqueIds = Array.from(new Set(missingOwners));
      const fetched = await Promise.all(
        uniqueIds.map(async (ownerId) => {
          try {
            const profile = await userRepository.getUserProfile(ownerId);
            return profile ?? { id: ownerId };
          } catch {
            return { id: ownerId };
          }
        })
      );

      if (cancelled) return;

      setProfiles((prev) => {
        const next = { ...prev };
        fetched.forEach((profile) => {
          next[profile.id] = profile;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [libraries, profiles]);

  return profiles;
}
