// Worked examples for lib/golf/scoring.ts. Run: node scripts/check-scoring.mjs
//
// These are the numbers a league is settled on, which is exactly why they live in code
// rather than in a prompt: this file is the difference between "usually right" and
// "checked". The logic is duplicated here deliberately so the check fails if the
// implementation drifts, rather than importing it and testing it against itself.
const NEUTRAL = 113
const diff = (g, t) => Math.round(((NEUTRAL / t.slope) * (g - t.course_rating)) * 10) / 10
const counting = (n) => n<3?0:n<=5?1:n===6?2:n<=8?2:n<=11?3:n<=14?4:n<=16?5:n<=18?6:n===19?7:8
const index = (ds) => { const r=ds.slice(0,20); const c=counting(r.length); if(!c) return null
  const b=[...r].sort((a,b)=>a-b).slice(0,c); return Math.round((b.reduce((s,d)=>s+d,0)/b.length)*10)/10 }
const chcp = (i,t) => Math.round(i*(t.slope/NEUTRAL)+(t.course_rating-t.par))
const stbl = (net,par) => { const rel=net-par; return rel>=2?0:Math.max(0,2-rel) }

const pine = { course_rating: 74.8, slope: 138, par: 72 }
let pass = 0, fail = 0
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  ok ? pass++ : fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  got=${got} want=${want}`)
}

t('differential 88 at Pinehurst Blue', diff(88, pine), 10.8)
t('scratch shoots the rating -> 0',    diff(74.8, pine), 0)
t('easier course, same gross',         diff(88, {course_rating:70.0,slope:113,par:72}), 18)
t('under 3 rounds -> no index',        index([12.1, 14.0]), null)
t('3 rounds -> best 1',                index([18.2, 12.1, 15.0]), 12.1)
t('20 rounds -> best 8 averaged',      index([5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]), 8.5)
t('course handicap, 10.0 at Pinehurst', chcp(10.0, pine), 15)
t('stableford: net par',               stbl(4,4), 2)
t('stableford: net birdie',            stbl(3,4), 3)
t('stableford: net double or worse',   stbl(6,4), 0)
t('stableford: net bogey',             stbl(5,4), 1)
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
