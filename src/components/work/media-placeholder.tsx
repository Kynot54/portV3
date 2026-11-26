/** 16:9 slot for a project screenshot or clip, until Kyle provides one. */
export function MediaPlaceholder() {
  return (
    // TODO(kyle): screenshot or clip
    <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border">
      <div
        aria-hidden="true"
        data-grain
        className="absolute inset-0 bg-[radial-gradient(circle,var(--border)_0.9px,transparent_1.15px)] bg-[length:3px_3px]"
      />
      <p className="micro-label absolute inset-0 flex items-center justify-center text-muted-foreground">
        <span className="rounded-full border bg-background px-3 py-1.5">
          Preview coming soon
        </span>
      </p>
    </div>
  );
}
