"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlusCircle,
  RefreshCw,
  WifiOff,
  Camera,
  ChevronDown,
  Phone,
} from "lucide-react";
import { STATUS_META } from "@/components/cdfms/field-ui";
import { FIELD_STATUSES } from "@/lib/cdfms/field-store";

const TOPICS: Array<{ q: string; icon: typeof PlusCircle; a: React.ReactNode }> = [
  {
    q: "How do I add a new project?",
    icon: PlusCircle,
    a: (
      <>
        Tap the green <strong>Add Project</strong> button at the bottom of the screen.
        You will be guided through five short steps. Only the fields marked with a red star
        (<span className="text-red-500 font-bold">*</span>) must be filled. Your work is saved
        automatically as you go, so you can stop and continue later.
      </>
    ),
  },
  {
    q: "How do I update a project I already added?",
    icon: RefreshCw,
    a: (
      <>
        On the <strong>My Projects</strong> screen, find the project card and tap
        <strong> Update progress</strong>. Choose the new status, slide the bar to show how far
        the work has come, and add a short note. Then tap <strong>Save progress update</strong>.
      </>
    ),
  },
  {
    q: "What do the colours mean?",
    icon: RefreshCw,
    a: (
      <div className="flex flex-col gap-1.5">
        {FIELD_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${STATUS_META[s].dot}`} />
            <strong>{s}</strong>
            <span className="text-ink-500">
              {s === "Planned"
                ? "— approved but work has not started"
                : s === "Ongoing"
                ? "— work is happening now"
                : s === "Stalled"
                ? "— work has stopped and needs attention"
                : "— work is finished"}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    q: "What happens if I have no internet?",
    icon: WifiOff,
    a: (
      <>
        You can keep working. Everything you type is saved on your phone or computer straight
        away. When your connection comes back, the system will sync your work. You will see an{" "}
        <strong>Online</strong> or <strong>Offline</strong> badge at the top of every screen so
        you always know.
      </>
    ),
  },
  {
    q: "How do I add photos?",
    icon: Camera,
    a: (
      <>
        On step 4 of adding a project, tap the upload area and choose photos from your phone.
        Photos are made smaller automatically before sending, so they use very little data.
        Clear photos of the project site help the Ministry confirm progress.
      </>
    ),
  },
];

export default function FieldHelp() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-serif text-2xl text-ink-900">Help & guidance</h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Simple answers to common questions. Tap a question to see the answer.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {TOPICS.map((t, i) => {
          const Icon = t.icon;
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-xl border border-ink-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px]"
              >
                <span className="h-8 w-8 rounded-lg bg-ministry-50 text-ministry-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 font-semibold text-ink-900 text-sm">{t.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-ink-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen ? (
                <div className="px-4 pb-4 pt-1 text-sm text-ink-700 leading-relaxed">{t.a}</div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Contact support */}
      <div className="rounded-xl bg-ministry-700 text-white p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Phone className="h-4 w-4 text-gold-300" />
          Still need help?
        </div>
        <p className="text-sm text-white/85 mt-1">
          Call your CEFANET Constituency Officer, or the CEFANET field support line during
          working hours. They are there to help you.
        </p>
      </div>

      <Link
        href="/field"
        className="text-center text-ministry-700 font-semibold text-sm min-h-[44px] flex items-center justify-center"
      >
        Back to my projects
      </Link>
    </div>
  );
}
