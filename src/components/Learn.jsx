import { useState } from 'react'

const TOPICS = [
  {
    id: 'what-is-hb',
    title: 'What is haemoglobin?',
    summary: 'And why does it matter in pregnancy?',
    body: [
      'Haemoglobin (HB) is the part of your blood that carries oxygen from your lungs to every part of your body — and to your baby.',
      'In pregnancy, your body makes more blood to support your growing baby. If your HB is too low, you may feel tired, dizzy, short of breath, or weak. Your baby may also not get enough oxygen to grow well.',
      'A healthy HB level in pregnancy is 11.0 g/dL or higher. Below that is called anaemia — and it is very common but very treatable.',
    ],
  },
  {
    id: 'iron-foods',
    title: 'Foods that build blood',
    summary: 'Local Ghanaian foods rich in iron',
    body: [
      'These foods are rich in iron, which your body uses to make haemoglobin:',
      '• Liver (cow, goat, chicken) — once or twice a week',
      '• Beans (red beans, black-eyed peas) — red-red, waakye, beans stew',
      '• Kontomire (cocoyam leaves) and other dark leafy greens like aleefu, ayoyo',
      '• Eggs (kosua) — boiled, fried, or in stew',
      '• Smoked fish, fresh fish, lean meat',
      '• Groundnut (peanut) soup with meat or fish',
      'Always pair iron foods with vitamin C foods in the same meal: orange, pawpaw, pineapple, guava, lemon. Vitamin C helps your body absorb the iron much better.',
    ],
  },
  {
    id: 'tablets',
    title: 'About your iron tablets',
    summary: 'How to take them so they work',
    body: [
      'The iron and folate tablets you receive at your antenatal visit are very important. Take them every day, even if you feel fine.',
      'Take them with water or fruit juice — not with tea, coffee, or milk. Tea and coffee block your body from absorbing the iron.',
      'It is normal for the tablets to make your stool dark or black — this is not blood, just unabsorbed iron.',
      'If the tablets cause nausea, take them with a small meal instead of on an empty stomach. Tell your midwife if the side effects are bad.',
      'Never share your tablets or take a different person\'s prescription.',
    ],
  },
  {
    id: 'danger-signs',
    title: 'Danger signs — go to a facility',
    summary: 'Do not wait if you have these symptoms',
    body: [
      'Go to your nearest health facility today (not next week) if you have any of these:',
      '• Feeling very weak, dizzy, or fainting',
      '• Heart beating fast even when resting',
      '• Shortness of breath when doing simple things',
      '• Severe headache or blurred vision',
      '• Bleeding from your private parts',
      '• Severe abdominal pain',
      '• Reduced or no movement from your baby (after 20 weeks)',
      'Bring your antenatal book and this app with you so the nurse or doctor can see your readings.',
    ],
  },
  {
    id: 'how-often',
    title: 'How often should I check my HB?',
    summary: 'A simple schedule',
    body: [
      'Most women have their HB checked at antenatal visits — usually at booking, around 28 weeks, and around 36 weeks.',
      'If you have anaemia (HB below 11), your midwife may want to check more often — every 2 to 4 weeks — to see if your level is improving.',
      'Always go to your scheduled antenatal visits, even when you feel well. Many problems in pregnancy have no symptoms at first.',
    ],
  },
]

export default function Learn() {
  const [openId, setOpenId] = useState(null)

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="logo">📖</div>
          <div>
            <h1>Learn</h1>
            <div className="subtitle">Simple information about your pregnancy and blood level</div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {TOPICS.map((topic) => {
          const open = openId === topic.id
          return (
            <div key={topic.id} className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenId(open ? null : topic.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  background: 'transparent',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
                    {topic.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 2 }}>
                    {topic.summary}
                  </div>
                </div>
                <div style={{
                  fontSize: 20,
                  color: 'var(--terracotta)',
                  transform: open ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  fontWeight: 300,
                  flexShrink: 0,
                }}>+</div>
              </button>

              {open && (
                <div style={{
                  padding: '0 18px 20px',
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  borderTop: '1px solid var(--line)',
                  paddingTop: 16,
                }}>
                  {topic.body.map((para, i) => (
                    <p key={i} style={{ marginBottom: i < topic.body.length - 1 ? 10 : 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 24, padding: '0 16px', lineHeight: 1.5 }}>
          This information is general guidance, not medical advice. Always follow what your midwife or doctor tells you.
        </div>
      </main>
    </>
  )
}
