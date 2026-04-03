export interface DailyTask {
  day: number;
  title: string;
  description: string;
  targetMetric?: string;
  targetValue?: number;
  targetDirection?: 'above' | 'below';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  iconName: string;
  iconSet?: 'ionicons' | 'material';
  color: string;
  dailyTasks: DailyTask[];
  tier: 'premium';
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'sleep-reset-7',
    title: '7-Day Sleep Reset',
    description:
      'Rebuild your sleep habits one night at a time. Each day introduces a science-backed technique to improve sleep quality.',
    duration: 7,
    iconName: 'moon',
    color: '#6366F1',
    tier: 'premium',
    dailyTasks: [
      {
        day: 1,
        title: 'No screens 1 hour before bed',
        description:
          'Blue light suppresses melatonin production. Put your phone away and read, stretch, or journal instead.',
        targetMetric: 'sleep_quality',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 2,
        title: 'Set a consistent bedtime alarm',
        description:
          'Pick a fixed bedtime and set an alarm 30 minutes before. A regular schedule trains your circadian clock.',
        targetMetric: 'sleep_quality',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 3,
        title: 'No caffeine after 2 PM',
        description:
          'Caffeine has a half-life of 5-6 hours. Cutting it early gives your body time to clear it before sleep.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 4,
        title: 'Cool your bedroom to 18-20 C',
        description:
          'Core body temperature must drop to initiate sleep. A cooler room accelerates this natural process.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 5,
        title: '10-minute evening meditation',
        description:
          'Guided breathing or body-scan meditation lowers cortisol and heart rate, preparing your nervous system for rest.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 6,
        title: 'No heavy meals 3h before bed',
        description:
          'Digesting a large meal raises core temperature and can cause discomfort. Eat light in the evening.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 7,
        title: 'Full sleep routine from day 1-6',
        description:
          'Combine all techniques into one evening routine: light meal, no caffeine, cool room, no screens, meditation, consistent bedtime.',
        targetMetric: 'sleep_quality',
        targetValue: 8,
        targetDirection: 'above',
      },
    ],
  },
  {
    id: 'energy-boost-14',
    title: '14-Day Energy Boost',
    description:
      'A two-week program to systematically raise your daily energy through morning habits, nutrition, movement, and recovery.',
    duration: 14,
    iconName: 'flash',
    color: '#F59E0B',
    tier: 'premium',
    dailyTasks: [
      {
        day: 1,
        title: '10 minutes of morning sunlight',
        description:
          'Expose your eyes to natural light within 30 minutes of waking. This resets your circadian clock and boosts cortisol at the right time.',
        targetMetric: 'energy',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 2,
        title: 'Drink 500ml of water before coffee',
        description:
          'Overnight dehydration lowers blood volume and energy. Rehydrate first, then caffeinate.',
        targetMetric: 'energy',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 3,
        title: '20-minute morning walk',
        description:
          'Light movement plus sunlight is the most potent natural energy booster. Walk briskly before your first meal.',
        targetMetric: 'energy',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 4,
        title: 'Protein-rich breakfast',
        description:
          'Aim for 30g of protein at breakfast. Protein stabilizes blood sugar and prevents the mid-morning crash.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 5,
        title: 'Delay caffeine 90 minutes after waking',
        description:
          'Let adenosine clear naturally first. Delayed caffeine avoids the afternoon crash and extends alertness.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 6,
        title: '30-minute workout before noon',
        description:
          'Exercise during your testosterone peak amplifies energy for the rest of the day. Keep it under 60 minutes.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 7,
        title: 'Eliminate added sugar today',
        description:
          'Sugar causes rapid energy spikes and crashes. Replace sweets with whole foods for stable energy levels.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 8,
        title: '5-minute cold exposure',
        description:
          'End your shower with 30-60 seconds of cold water, or do a 5-minute cold plunge. Norepinephrine surges boost alertness for hours.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 9,
        title: 'Take a 20-minute power nap',
        description:
          'A short nap between 1-3 PM restores afternoon alertness without disrupting nighttime sleep. Set an alarm.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 10,
        title: '10-minute breathwork session',
        description:
          'Try box breathing (4-4-4-4) or Wim Hof breathing. Controlled breathing resets your autonomic nervous system and sharpens focus.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 11,
        title: 'No screens during meals',
        description:
          'Mindful eating improves digestion and nutrient absorption. Better nourishment means more sustained energy.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 12,
        title: 'Stress management: journaling or walking',
        description:
          'Chronic stress drains energy through elevated cortisol. Spend 15 minutes journaling or walking in nature.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 13,
        title: 'Optimize your workspace lighting',
        description:
          'Bright light during the day, dim light in the evening. Proper light exposure supports natural energy rhythms.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 14,
        title: 'Full energy stack: combine all habits',
        description:
          'Morning sunlight, hydration, protein breakfast, delayed caffeine, movement, and stress management — run the full stack today.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
    ],
  },
  {
    id: 'peak-performance-30',
    title: '30-Day Peak Performance',
    description:
      'A comprehensive month-long program covering sleep, training, mental health, and integration for sustained peak performance.',
    duration: 30,
    iconName: 'trophy',
    color: '#22C55E',
    tier: 'premium',
    dailyTasks: [
      // Week 1: Foundation (sleep + hydration)
      {
        day: 1,
        title: 'Establish your sleep schedule',
        description:
          'Choose a fixed bedtime and wake time. Consistency is the single most important sleep habit.',
        targetMetric: 'sleep_quality',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 2,
        title: 'Track water intake: aim for 3L',
        description:
          'Proper hydration supports hormone production, cognition, and physical performance. Track every glass today.',
        targetMetric: 'energy',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 3,
        title: 'Create a dark sleeping environment',
        description:
          'Block all light sources in your bedroom. Even small amounts of light reduce melatonin and sleep depth.',
        targetMetric: 'sleep_quality',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 4,
        title: 'Morning sunlight within 30 minutes of waking',
        description:
          'Natural light triggers the cortisol awakening response and sets your circadian clock for the day.',
        targetMetric: 'energy',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 5,
        title: 'Eliminate evening blue light',
        description:
          'Use blue-light blockers or night mode after sunset. Protect melatonin production for deeper sleep.',
        targetMetric: 'sleep_quality',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 6,
        title: 'Mineral-rich evening drink',
        description:
          'Magnesium and potassium support relaxation. Try a magnesium supplement or banana smoothie before bed.',
        targetMetric: 'sleep_quality',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 7,
        title: 'Week 1 review: rate your sleep foundation',
        description:
          'Reflect on the past 6 days. Which habits felt natural? Which need more practice? Commit to keeping at least 3.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      // Week 2: Activity (training + timing)
      {
        day: 8,
        title: 'Morning resistance training',
        description:
          'Train within your testosterone peak window (6-10 AM). Compound lifts like squats and deadlifts maximize the hormonal response.',
        targetMetric: 'training',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 9,
        title: 'Active recovery: mobility and stretching',
        description:
          'Spend 20 minutes on foam rolling, dynamic stretching, or yoga. Recovery is when adaptation happens.',
        targetMetric: 'training',
        targetValue: 3,
        targetDirection: 'above',
      },
      {
        day: 10,
        title: 'Zone 2 cardio session (30 minutes)',
        description:
          'Low-intensity steady-state cardio builds mitochondrial density. Keep your heart rate at 60-70% of max.',
        targetMetric: 'training',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 11,
        title: 'Train your weakest movement pattern',
        description:
          'Identify your weakest lift or movement. Focused practice on weaknesses yields the biggest performance gains.',
        targetMetric: 'training',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 12,
        title: 'Post-workout nutrition within 60 minutes',
        description:
          'Consume 30-40g protein and carbohydrates after training. This window optimizes muscle protein synthesis.',
        targetMetric: 'training',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 13,
        title: 'High-intensity interval training',
        description:
          'Short HIIT sessions (15-20 min) boost growth hormone and testosterone acutely. Go hard, rest fully.',
        targetMetric: 'training',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 14,
        title: 'Week 2 review: rest and reflect',
        description:
          'Full rest day. Review your training logs. How did morning workouts affect your energy and mood?',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      // Week 3: Mental (stress + mood)
      {
        day: 15,
        title: '10-minute morning meditation',
        description:
          'Mindfulness meditation reduces cortisol and improves emotional regulation. Start with guided breathing.',
        targetMetric: 'stress',
        targetValue: 5,
        targetDirection: 'below',
      },
      {
        day: 16,
        title: 'Gratitude journaling: write 3 things',
        description:
          'Gratitude practice shifts focus from stress to appreciation. Write three specific things you are grateful for today.',
        targetMetric: 'stress',
        targetValue: 5,
        targetDirection: 'below',
      },
      {
        day: 17,
        title: 'Social connection: reach out to a friend',
        description:
          'Social bonds lower cortisol and boost oxytocin. Call or meet a friend for a genuine conversation today.',
        targetMetric: 'stress',
        targetValue: 5,
        targetDirection: 'below',
      },
      {
        day: 18,
        title: 'Nature exposure: 30 minutes outdoors',
        description:
          'Time in nature measurably reduces stress hormones and blood pressure. Walk in a park, forest, or by water.',
        targetMetric: 'stress',
        targetValue: 4,
        targetDirection: 'below',
      },
      {
        day: 19,
        title: 'Digital detox: 2 hours phone-free',
        description:
          'Constant notifications elevate stress. Block 2 uninterrupted hours without phone, email, or social media.',
        targetMetric: 'stress',
        targetValue: 4,
        targetDirection: 'below',
      },
      {
        day: 20,
        title: 'Box breathing under pressure',
        description:
          'Practice 4-4-4-4 box breathing during a stressful moment. This technique activates the parasympathetic nervous system on demand.',
        targetMetric: 'stress',
        targetValue: 4,
        targetDirection: 'below',
      },
      {
        day: 21,
        title: 'Week 3 review: stress management toolkit',
        description:
          'List the stress techniques that worked best for you. Build your personal toolkit from the past 7 days.',
        targetMetric: 'stress',
        targetValue: 4,
        targetDirection: 'below',
      },
      // Week 4: Integration (all together)
      {
        day: 22,
        title: 'Full morning routine: sunlight + movement + cold',
        description:
          'Combine morning sunlight, a 20-minute walk, and a cold shower finish. Stack the foundations for maximum energy.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 23,
        title: 'Optimize your training and nutrition',
        description:
          'Morning workout in your peak window, protein-rich post-workout meal, and proper hydration all day.',
        targetMetric: 'training',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 24,
        title: 'Evening wind-down protocol',
        description:
          'No screens after 9 PM, cool bedroom, magnesium, 10-minute meditation. Execute the full sleep stack.',
        targetMetric: 'sleep_quality',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 25,
        title: 'Stress-proof your day',
        description:
          'Morning meditation, nature walk at lunch, digital detox in the evening. Layer all stress management tools.',
        targetMetric: 'stress',
        targetValue: 4,
        targetDirection: 'below',
      },
      {
        day: 26,
        title: 'Peak performance day: all systems go',
        description:
          'Execute every habit: sleep routine, morning stack, training, nutrition, stress management. This is your peak protocol.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 27,
        title: 'Active recovery and reflection',
        description:
          'Light movement, journaling, and meal prep. Sustainable performance requires strategic rest days.',
        targetMetric: 'energy',
        targetValue: 6,
        targetDirection: 'above',
      },
      {
        day: 28,
        title: 'Social + physical: group activity',
        description:
          'Combine social connection with physical activity. Team sport, gym with a friend, or a group hike.',
        targetMetric: 'training',
        targetValue: 5,
        targetDirection: 'above',
      },
      {
        day: 29,
        title: 'Teach someone what you learned',
        description:
          'Teaching solidifies knowledge. Share one insight from this program with a friend or write it down in detail.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
      {
        day: 30,
        title: 'Design your personal daily protocol',
        description:
          'Using everything you learned, write your own daily routine. Pick the habits that moved the needle most for you.',
        targetMetric: 'energy',
        targetValue: 7,
        targetDirection: 'above',
      },
    ],
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
