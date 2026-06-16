import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { auth, getStoredUser, updateStoredUser } from '../lib/api.js'
import { greetingByHour } from '../lib/utils.js'
import Modal from './Modal.jsx'

const TITLE_PRESETS = ['مستر', 'أ.', 'د.', 'م.', 'كابتن']

/** Lets the logged-in user edit their own display name + honorific title. */
export default function ProfileModal({ open, onClose }) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastOpen, setLastOpen] = useState(false)

  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      const u = getStoredUser() || {}
      setName(u.name_ar || '')
      setTitle(u.title || '')
      setError('')
    }
  }

  async function save() {
    if (!name.trim()) { setError('الاسم مطلوب'); return }
    setSaving(true); setError('')
    try {
      const updated = await auth.updateMe({ name_ar: name.trim(), title: title.trim() || null })
      updateStoredUser(updated)
      // reload so the name/title refresh everywhere (greeting, top bar)
      window.location.reload()
    } catch (e) {
      setError(e.message || 'تعذّر الحفظ')
      setSaving(false)
    }
  }

  const preview = `${greetingByHour()}، ${[title.trim(), (name.trim().split(' ')[0] || '')].filter(Boolean).join(' ')} 👋`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ملفي الشخصي"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1" disabled={saving}>إلغاء</button>
          <button onClick={save} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label className="label">الاسم *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سيف" />
        </div>
        <div>
          <label className="label">اللقب / الوصف (اختياري)</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مستر، أ.، د. ..." />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TITLE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTitle(t)}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-bg border border-border hover:border-brand-200 hover:text-brand"
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTitle('')}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-bg border border-border hover:border-red-200 hover:text-red-600"
            >
              بدون
            </button>
          </div>
        </div>
        <div className="rounded-xl bg-bg/60 border border-border/50 p-3">
          <div className="text-[10px] font-extrabold text-ink-tertiary mb-1">معاينة التحية</div>
          <div className="font-extrabold text-ink-primary">{preview}</div>
        </div>
      </div>
    </Modal>
  )
}
