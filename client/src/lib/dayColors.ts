// Helper function to get consistent pastel colors for days
export const PASTEL_COLORS = [
  {
    bg: 'bg-pink-100',
    hover: 'hover:bg-pink-200',
    active: 'bg-pink-300',
    text: 'text-pink-900',
    border: 'border-pink-200',
    light: '#fce7f3', // pink-100
  },
  {
    bg: 'bg-blue-100',
    hover: 'hover:bg-blue-200',
    active: 'bg-blue-300',
    text: 'text-blue-900',
    border: 'border-blue-200',
    light: '#dbeafe', // blue-100
  },
  {
    bg: 'bg-green-100',
    hover: 'hover:bg-green-200',
    active: 'bg-green-300',
    text: 'text-green-900',
    border: 'border-green-200',
    light: '#dcfce7', // green-100
  },
  {
    bg: 'bg-yellow-100',
    hover: 'hover:bg-yellow-200',
    active: 'bg-yellow-300',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    light: '#fef9c3', // yellow-100
  },
  {
    bg: 'bg-purple-100',
    hover: 'hover:bg-purple-200',
    active: 'bg-purple-300',
    text: 'text-purple-900',
    border: 'border-purple-200',
    light: '#f3e8ff', // purple-100
  },
  {
    bg: 'bg-orange-100',
    hover: 'hover:bg-orange-200',
    active: 'bg-orange-300',
    text: 'text-orange-900',
    border: 'border-orange-200',
    light: '#ffedd5', // orange-100
  },
  {
    bg: 'bg-teal-100',
    hover: 'hover:bg-teal-200',
    active: 'bg-teal-300',
    text: 'text-teal-900',
    border: 'border-teal-200',
    light: '#ccfbf1', // teal-100
  },
  {
    bg: 'bg-indigo-100',
    hover: 'hover:bg-indigo-200',
    active: 'bg-indigo-300',
    text: 'text-indigo-900',
    border: 'border-indigo-200',
    light: '#e0e7ff', // indigo-100
  },
];

export function getDayColorIndex(tripStartDate: number, eventDate: number): number {
  const daysDiff = Math.floor((eventDate - tripStartDate) / (1000 * 60 * 60 * 24));
  return daysDiff % PASTEL_COLORS.length;
}

export function getDayColor(tripStartDate: number, eventDate: number) {
  const index = getDayColorIndex(tripStartDate, eventDate);
  return PASTEL_COLORS[index];
}
