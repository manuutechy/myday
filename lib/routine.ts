export interface RoutineBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  color: string;
  icon: string;
}

export const ROUTINE_BLOCKS: RoutineBlock[] = [
  { id: 'wind-down', label: 'Wind-down', start: '00:00', end: '00:30', color: '#888780', icon: 'Moon' },
  { id: 'sleep', label: 'Sleep / Rest 💤', start: '00:30', end: '07:30', color: '#111111', icon: 'Moon' },
  { id: 'wake', label: 'Wake ritual', start: '07:30', end: '08:00', color: '#FF6B00', icon: 'Droplet' },
  { id: 'chores-am', label: 'Morning chores', start: '08:00', end: '08:30', color: '#1D9E75', icon: 'Home' },
  { id: 'breakfast', label: 'Breakfast + plan', start: '08:30', end: '09:00', color: '#FF6B00', icon: 'Coffee' },
  { id: 'client-acq', label: 'Client acquisition', start: '09:00', end: '10:00', color: '#BA7517', icon: 'Mail' },
  { id: 'deep1', label: 'Deep work #1', start: '10:00', end: '12:30', color: '#534AB7', icon: 'Zap' },
  { id: 'lunch', label: 'Lunch + chores', start: '12:30', end: '13:30', color: '#1D9E75', icon: 'UtensilsCrossed' },
  { id: 'deep2', label: 'Deep work #2', start: '13:30', end: '16:00', color: '#534AB7', icon: 'Code2' },
  { id: 'comms', label: 'Comms window', start: '16:00', end: '16:30', color: '#BA7517', icon: 'MessageCircle' },
  { id: 'hobby', label: 'Hobby / recharge', start: '16:30', end: '18:00', color: '#D4537E', icon: 'Star' },
  { id: 'personal', label: 'Personal time', start: '18:00', end: '20:00', color: '#D4537E', icon: 'Users' },
  { id: 'learning', label: 'Light learning', start: '20:00', end: '21:00', color: '#1D9E75', icon: 'Brain' },
  { id: 'deep3', label: 'Deep work #3 ⭐', start: '21:00', end: '23:30', color: '#3C3489', icon: 'Terminal' },
  { id: 'review', label: 'Daily review', start: '23:30', end: '00:00', color: '#888780', icon: 'CheckSquare' },
];

export function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentBlock(date: Date = new Date()) {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const secondsInCurrentMinute = date.getSeconds();

  // Find matching block
  let activeBlock = ROUTINE_BLOCKS.find((block) => {
    const startMin = toMinutes(block.start);
    const endMin = toMinutes(block.end);
    
    if (endMin === 0) { // Special check for review block ending at 00:00 (which is 1440m)
      return currentMinutes >= startMin && currentMinutes < 1440;
    }
    
    return currentMinutes >= startMin && currentMinutes < endMin;
  });

  // Default fallback (should not occur since the timeline is fully filled)
  if (!activeBlock) {
    activeBlock = ROUTINE_BLOCKS[1]; // Sleep block
  }

  const startMin = toMinutes(activeBlock.start);
  let endMin = toMinutes(activeBlock.end);
  if (endMin === 0) endMin = 1440;

  const totalBlockMinutes = endMin - startMin;
  const elapsedMinutes = currentMinutes - startMin;
  const elapsedSeconds = elapsedMinutes * 60 + secondsInCurrentMinute;
  const totalBlockSeconds = totalBlockMinutes * 60;

  const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / totalBlockSeconds) * 100));
  const minutesRemaining = endMin - currentMinutes;

  // Find next block
  const currentIndex = ROUTINE_BLOCKS.indexOf(activeBlock);
  const nextIndex = (currentIndex + 1) % ROUTINE_BLOCKS.length;
  const nextBlock = ROUTINE_BLOCKS[nextIndex];

  return {
    activeBlock,
    progressPercent,
    minutesRemaining,
    nextBlock,
  };
}
