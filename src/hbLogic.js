// WHO haemoglobin thresholds for pregnancy (g/dL)
// Normal:    >= 11.0
// Mild:      10.0 - 10.9
// Moderate:  7.0  - 9.9
// Severe:    < 7.0

export function classify(hb) {
  if (hb == null || isNaN(hb)) return null
  if (hb >= 11.0) return 'normal'
  if (hb >= 10.0) return 'mild'
  if (hb >= 7.0) return 'moderate'
  return 'severe'
}

export const STATUS_META = {
  normal:   { label: 'Healthy',          color: 'normal',   tone: 'good' },
  mild:     { label: 'Mild anaemia',     color: 'mild',     tone: 'warn' },
  moderate: { label: 'Moderate anaemia', color: 'moderate', tone: 'warn' },
  severe:   { label: 'Severe anaemia',   color: 'severe',   tone: 'alert' },
}

// BMI calculation. Note: standard BMI is intended for non-pregnant adults.
// In pregnancy we typically use *pre-pregnancy* weight for BMI classification
// (per WHO/IOM guidance). We label the result accordingly so users don't
// confuse current weight in late pregnancy with a BMI category.
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const m = heightCm / 100
  const bmi = weightKg / (m * m)
  return Math.round(bmi * 10) / 10
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warn',
    note: 'A higher pre-pregnancy BMI may have meant your iron stores were lower at the start of pregnancy. Eat regular meals and don\'t skip food.' }
  if (bmi < 25)   return { label: 'Healthy weight', tone: 'good',
    note: 'A healthy starting weight. Focus on iron-rich foods and regular antenatal visits.' }
  if (bmi < 30)   return { label: 'Overweight', tone: 'warn',
    note: 'Mention this to your midwife — they may give you specific dietary guidance for your pregnancy.' }
  return { label: 'Obese', tone: 'warn',
    note: 'Mention this to your midwife — pregnancies in this BMI range need closer monitoring. They will guide you.' }
}

// Honest, evidence-aligned expected-gain language.
// We do NOT promise specific numbers because real recovery depends on iron stores,
// cause of anaemia, gestational age, parasites, and tablet compliance.
export function getExpectedGainNote(status) {
  switch (status) {
    case 'normal':
      return null
    case 'mild':
    case 'moderate':
      return 'With consistent iron-rich meals and your daily iron and folate tablets, most women see improvement of about 1–2 g/dL over 3–4 weeks. If your next reading does not improve, your midwife may need to investigate other causes such as malaria or parasites.'
    case 'severe':
      return 'Severe anaemia usually needs medical treatment, not diet alone. After treatment at the facility, your midwife will tell you when to expect your blood level to recover. Do not delay going.'
    default:
      return null
  }
}

// Advice keyed to status. Plain language. Local Ghanaian food references.
export function getAdvice(status) {
  switch (status) {
    case 'normal':
      return {
        tone: 'good',
        title: 'Keep going strong',
        lines: [
          'Your blood level is in the healthy range for pregnancy. Well done.',
          'Continue eating iron-rich foods every day: kontomire (cocoyam leaves), aleefu, dark green leaves, beans, kosua (eggs), liver, fish, and lean meat when you can.',
          'Pair these with fruits like orange, pawpaw, pineapple, or guava in the same meal — vitamin C helps your body absorb iron.',
          'Keep taking your iron and folate tablets from the antenatal clinic. Do not stop just because you feel fine.',
        ],
      }
    case 'mild':
      return {
        tone: 'warn',
        title: 'A little low — let’s build it up',
        lines: [
          'Your blood level is slightly low. This is common in pregnancy and you can improve it.',
          'Eat iron-rich foods at every meal: kontomire stew, beans (red-red), boiled eggs, smoked fish, liver once or twice a week, and dark leafy vegetables.',
          'Always add a fruit rich in vitamin C — orange, pawpaw, guava, pineapple — to help your body take in the iron.',
          'Avoid drinking tea or coffee right after eating. They block iron from being absorbed. Wait at least one hour.',
          'Take your iron and folate tablets every day, even if you feel okay. Mention this reading to your midwife at your next visit.',
        ],
      }
    case 'moderate':
      return {
        tone: 'warn',
        title: 'Please see your midwife soon',
        lines: [
          'Your blood level is low enough that you need extra care. This can affect your energy and your baby’s growth.',
          'Visit your antenatal clinic or CHPS compound this week. Show them this reading. They may adjust your tablets or do more tests.',
          'Eat iron-rich foods at every single meal: liver, beans, kontomire, aleefu, eggs, smoked fish, groundnut soup with leafy vegetables.',
          'Add vitamin C foods to every meal: oranges, pawpaw, guava, fresh pineapple, lemon in water.',
          'Do not skip your iron and folate tablets. Take them with water or fruit juice — never with tea, coffee, or milk.',
          'Rest more than usual and tell someone if you feel very tired, dizzy, or short of breath.',
        ],
      }
    case 'severe':
      return {
        tone: 'alert',
        title: 'Go to the health facility today',
        lines: [
          'Your blood level is very low. This is a medical concern for you and your baby. Please go to the nearest health facility today, not next week.',
          'If you feel very weak, dizzy, short of breath, or your heart is beating fast, ask someone to take you straight away.',
          'Bring this app or a written note of your reading so the nurse or doctor sees it immediately.',
          'You may need stronger treatment than tablets alone. The midwife or doctor will guide you.',
          'Continue eating iron-rich foods (liver, beans, kontomire, eggs, fish) but do not delay going to the facility.',
        ],
      }
    default:
      return null
  }
}

// Simple trend message comparing latest two readings
export function getTrendMessage(readings) {
  if (!readings || readings.length < 2) return null
  const sorted = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date))
  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const diff = last.hb - prev.hb
  if (Math.abs(diff) < 0.3) return 'Your level is stable since your last reading.'
  if (diff > 0) return `Going up — ${diff.toFixed(1)} g/dL higher than last reading. Good progress.`
  return `Going down — ${Math.abs(diff).toFixed(1)} g/dL lower than last reading. Pay extra attention to your meals and tablets.`
}
