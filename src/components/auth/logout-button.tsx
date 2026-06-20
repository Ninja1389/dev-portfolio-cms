"use client"

export function LogoutButton({ signOutAction }: { signOutAction: () => Promise<void> }) {
  return (
    <button
      type="button"
      onClick={() => signOutAction()}
      className="w-full text-left"
    >
      Esci
    </button>
  )
}
