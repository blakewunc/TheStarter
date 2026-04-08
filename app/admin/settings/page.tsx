'use client'

import { useEffect, useState } from 'react'

interface FeatureTile {
  icon: string
  title: string
  description: string
}

const DEFAULT_TILES: FeatureTile[] = [
  { icon: '📍', title: 'Trip Planning', description: 'Build full itineraries day by day.' },
  { icon: '💰', title: 'Budget Splitting', description: 'Track costs and split them fairly.' },
  { icon: '⛳', title: 'Golf Tools', description: 'Tee times, scorecards, and handicaps.' },
  { icon: '🎉', title: 'Group Coordination', description: 'RSVP, availability, and announcements.' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '0.5px solid rgba(28,26,23,0.20)',
  borderRadius: '5px',
  fontSize: '13px',
  color: '#1C1A17',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: '#A09890',
  display: 'block',
  marginBottom: '6px',
}

export default function AdminSettings() {
  const [tiles, setTiles] = useState<FeatureTile[]>(DEFAULT_TILES)
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then(({ settings }) => {
        if (settings?.landing_features) setTiles(settings.landing_features)
        if (settings?.site_logo?.url) setLogoUrl(settings.site_logo.url)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateTile = (i: number, field: keyof FeatureTile, value: string) => {
    setTiles((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await Promise.all([
        fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'landing_features', value: tiles }),
        }),
        fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'site_logo', value: { url: logoUrl } }),
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1A17', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Site Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{ background: saving ? '#70798C' : saved ? '#3B6D11' : '#1C1A17', color: '#F5F1ED', borderRadius: '5px', padding: '10px 20px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.2s' }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#A09890', fontSize: '13px' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Logo */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '16px' }}>Logo</h2>
            <label style={labelStyle}>Logo Image URL</label>
            <input
              style={inputStyle}
              placeholder="https://… (leave blank to use text logo)"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={logoUrl} alt="Logo preview" style={{ height: '40px', objectFit: 'contain', borderRadius: '4px', border: '0.5px solid rgba(28,26,23,0.10)' }} />
                <span style={{ fontSize: '11px', color: '#A09890' }}>Preview</span>
              </div>
            )}
          </div>

          {/* Feature Tiles */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(28,26,23,0.10)', borderRadius: '8px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1C1A17', marginBottom: '4px' }}>Feature Tiles</h2>
            <p style={{ fontSize: '12px', color: '#A09890', marginBottom: '20px' }}>
              Displayed on the landing page below the hero section.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tiles.map((tile, i) => (
                <div key={i} style={{ padding: '16px', background: '#FDFCFA', border: '0.5px solid rgba(28,26,23,0.08)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#A09890', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Tile {i + 1}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginTop: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={labelStyle}>Icon</label>
                      <input
                        style={inputStyle}
                        placeholder="🏖️"
                        value={tile.icon}
                        onChange={(e) => updateTile(i, 'icon', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <input
                        style={inputStyle}
                        placeholder="Feature name"
                        value={tile.title}
                        onChange={(e) => updateTile(i, 'title', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <input
                      style={inputStyle}
                      placeholder="Short description…"
                      value={tile.description}
                      onChange={(e) => updateTile(i, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
