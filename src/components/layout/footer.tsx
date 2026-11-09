export function Footer() {
  return (
    <footer className="border-t border-brand-border py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 text-xs text-brand-muted sm:px-6">
        <p className="badge-mono">Design. Create. Produce. Grow.</p>
        <p>&copy; {new Date().getFullYear()} Freakin&apos;s Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
