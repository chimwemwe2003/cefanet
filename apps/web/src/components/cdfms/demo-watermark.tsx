export function DemoWatermark() {
  return (
    <div className="fixed bottom-3 right-3 z-50 select-none pointer-events-none">
      <div className="rounded-full bg-ink-900/85 text-white text-[10px] tracking-[.2em] uppercase px-3 py-1.5 shadow-ministry-lg">
        Demo mode
      </div>
    </div>
  );
}
