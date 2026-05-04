import { useEffect, useState } from "react";
import {
  apiFetch,
  AUTH_STATE_EVENT,
  hasUserSession,
  resolveAvatarUrl,
} from "../utils/api";

const DEFAULT_AVATAR = resolveAvatarUrl("");

const useCurrentUserAvatar = () => {
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    let ignore = false;

    const updateAvatar = (value = "") => {
      if (!ignore) {
        setAvatarSrc(resolveAvatarUrl(value));
      }
    };

    const fetchCurrentUser = async () => {
      if (!hasUserSession()) {
        updateAvatar("");
        return;
      }

      try {
        const response = await apiFetch("/api/user");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch current user avatar",
          );
        }

        updateAvatar(data.user?.avatar || "");
      } catch {
        updateAvatar("");
      }
    };

    const handleProfileUpdated = (event) => {
      updateAvatar(event.detail?.avatarSrc || event.detail?.avatar || "");
    };

    fetchCurrentUser();

    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener(AUTH_STATE_EVENT, fetchCurrentUser);
    window.addEventListener("storage", fetchCurrentUser);

    return () => {
      ignore = true;
      window.removeEventListener("profile-updated", handleProfileUpdated);
      window.removeEventListener(AUTH_STATE_EVENT, fetchCurrentUser);
      window.removeEventListener("storage", fetchCurrentUser);
    };
  }, []);

  return avatarSrc;
};

export default useCurrentUserAvatar;
