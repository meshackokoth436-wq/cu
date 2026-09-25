import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import {
  clearDailyScripture,
  fetchDailyScriptures,
  saveDailyScripture,
  type DailyScripture,
} from '@/features/daily-scriptures/daily-scriptures.api';

type SlotForm = {
  reference: string;
  text: string;
  theme: string;
  reflection: string;
};

const emptyForm = (): SlotForm => ({
  reference: '',
  text: '',
  theme: '',
  reflection: '',
});

export function DailyScripturesAdmin() {
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [forms, setForms] = useState<Record<number, SlotForm>>({
    1: emptyForm(),
    2: emptyForm(),
    3: emptyForm(),
    4: emptyForm(),
    5: emptyForm(),
  });
  const [message, setMessage] = useState('');

  const { data: scriptures = [], isLoading } = useQuery({
    queryKey: ['daily-scriptures-admin'],
    queryFn: fetchDailyScriptures,
  });

  useEffect(() => {
    const next = { ...forms };
    for (const scripture of scriptures) {
      next[scripture.day_slot] = {
        reference: scripture.reference ?? '',
        text: scripture.text ?? '',
        theme: scripture.theme ?? '',
        reflection: scripture.reflection ?? '',
      };
    }
    setForms(next);
    // The API is the source of truth; this only hydrates the five editor slots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptures]);

  const configuredCount = useMemo(
    () => scriptures.filter((s) => s.is_active && s.reference && s.text).length,
    [scriptures]
  );

  const saveMutation = useMutation({
    mutationFn: async ({ slot, form }: { slot: number; form: SlotForm }) =>
      saveDailyScripture(slot, form),
    onSuccess: (_saved, variables) => {
      setMessage(`Day ${variables.slot} scripture saved successfully.`);
      queryClient.invalidateQueries({ queryKey: ['daily-scriptures-admin'] });
      setTimeout(() => setMessage(''), 3500);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearDailyScripture,
    onSuccess: (_data, slot) => {
      setForms((prev) => ({ ...prev, [slot]: emptyForm() }));
      setMessage(`Day ${slot} scripture cleared.`);
      queryClient.invalidateQueries({ queryKey: ['daily-scriptures-admin'] });
      setTimeout(() => setMessage(''), 3500);
    },
  });

  const form = forms[selectedSlot] ?? emptyForm();
  const setField = (field: keyof SlotForm, value: string) =>
    setForms((prev) => ({
      ...prev,
      [selectedSlot]: { ...prev[selectedSlot], [field]: value },
    }));

  const configuredForSlot = scriptures.find((s: DailyScripture) => s.day_slot === selectedSlot);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
              <BookOpen size={14} /> Database-managed
            </div>
            <h2 className="mt-3 text-xl font-black text-slate-900">5 Daily Scriptures</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              Enter five scriptures here. One scripture is displayed each day in a fixed five-day
              rotation. The content is stored in the database, not in the website source files.
              The daily boundary follows Africa/Nairobi time.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700">
            {configuredCount}/5 days configured
          </div>
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={15} />
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading scripture schedule…</div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((slot) => {
                const configured = scriptures.some((s) => s.day_slot === slot && s.is_active);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      selectedSlot === slot
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Day
                      </span>
                      {configured && <CheckCircle2 size={14} className="text-emerald-600" />}
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900">{slot}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Scripture for rotation day {selectedSlot}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {configuredForSlot ? 'Currently saved in the database.' : 'Not configured yet.'}
                  </p>
                </div>
                {configuredForSlot && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMutation.mutate(selectedSlot)}
                    loading={clearMutation.isPending}
                    className="gap-1.5 text-xs font-bold text-red-700 hover:text-red-800"
                  >
                    <Trash2 size={13} /> Clear
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Bible reference
                  </span>
                  <input
                    value={form.reference}
                    onChange={(e) => setField('reference', e.target.value)}
                    placeholder="e.g. Philippians 4:13"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Scripture text
                  </span>
                  <textarea
                    rows={5}
                    value={form.text}
                    onChange={(e) => setField('text', e.target.value)}
                    placeholder="Enter the scripture text..."
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-emerald-600"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Theme (optional)
                    </span>
                    <input
                      value={form.theme}
                      onChange={(e) => setField('theme', e.target.value)}
                      placeholder="e.g. Faith"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Devotional thought (optional)
                    </span>
                    <input
                      value={form.reflection}
                      onChange={(e) => setField('reflection', e.target.value)}
                      placeholder="Short reflection..."
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={!form.reference.trim() || !form.text.trim()}
                    loading={saveMutation.isPending}
                    onClick={() => saveMutation.mutate({ slot: selectedSlot, form })}
                    className="gap-1.5 bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Save size={14} /> Save Day {selectedSlot}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
