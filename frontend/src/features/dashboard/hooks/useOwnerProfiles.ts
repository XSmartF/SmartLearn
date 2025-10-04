import { useEffect, useState } from "react";
import { userRepository } from "@/shared/lib/repositories/UserRepository";
import type { LibraryMeta } from "@/shared/lib/models";

export interface DashboardOwnerProfile {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

const ownerProfileCache = new Map<string, DashboardOwnerProfile>();

export function useOwnerProfiles(libraries: LibraryMeta[]): Record<string, DashboardOwnerProfile> {
  const [profiles, setProfiles] = useState<Record<string, DashboardOwnerProfile>>(() => {
    if (!ownerProfileCache.size) return {};
    const initial: Record<string, DashboardOwnerProfile> = {};
    ownerProfileCache.forEach((value, key) => {
      initial[key] = value;
    });
    return initial;
  });

  useEffect(() => {
    const seenIds = new Set<string>([...ownerProfileCache.keys(), ...Object.keys(profiles)]);

    const missingOwners = libraries
      .map((library) => library.ownerId)
      .filter((ownerId): ownerId is string => Boolean(ownerId) && !seenIds.has(ownerId));

    if (missingOwners.length === 0) {
      const cachedOwners = libraries
        .map((library) => library.ownerId)
        .filter((ownerId): ownerId is string => Boolean(ownerId) && ownerProfileCache.has(ownerId));

      if (cachedOwners.length) {
        setProfiles((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const ownerId of cachedOwners) {
            const cached = ownerProfileCache.get(ownerId);
            if (!cached) continue;
            if (!next[ownerId]) {
              next[ownerId] = cached;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }

      return;
    }

    let cancelled = false;

    (async () => {
      const uniqueIds = Array.from(new Set(missingOwners));
      const cachedOwners: DashboardOwnerProfile[] = [];
      const idsToFetch: string[] = [];

      uniqueIds.forEach((ownerId) => {
        const cached = ownerProfileCache.get(ownerId);
        if (cached) {
          cachedOwners.push(cached);
        } else {
          idsToFetch.push(ownerId);
        }
      });

      if (cachedOwners.length) {
        setProfiles((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const profile of cachedOwners) {
            if (!next[profile.id]) {
              next[profile.id] = profile;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }

      if (!idsToFetch.length) {
        return;
      }

      const fetched = await Promise.all(
        idsToFetch.map(async (ownerId) => {
          try {
            const profile = await userRepository.getUserProfile(ownerId);
            const result = profile ?? { id: ownerId };
            ownerProfileCache.set(ownerId, result);
            return result;
          } catch {
            const fallback = { id: ownerId };
            ownerProfileCache.set(ownerId, fallback);
            return fallback;
          }
        })
      );

      if (cancelled) return;

      setProfiles((prev) => {
        const next = { ...prev };
        let changed = false;
        fetched.forEach((profile) => {
          if (!next[profile.id]) {
            next[profile.id] = profile;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [libraries, profiles]);

  return profiles;
}
