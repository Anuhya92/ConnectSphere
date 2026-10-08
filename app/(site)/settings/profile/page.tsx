import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { updateProfile } from "@/app/actions/profile";
import { getViewer } from "@/lib/viewer";
import { displayName, getImageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit profile" };

export default async function SettingsProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings/profile");
  if (!viewer.profile) {
    return <p className="alert-error">Your profile could not be loaded. Try logging in again.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ProfileForm
        action={updateProfile}
        fullName={displayName(viewer.profile)}
        avatarUrl={getImageUrl(viewer.profile.avatar_url)}
        cancelHref={`/profile/${viewer.profile.username}`}
      />
    </div>
  );
}
