// Helper function to format time in 24-hour format
export function formatTime24(time: string | undefined | null): string {
  if (!time) return "";
  
  // If already in HH:mm format, return as is
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // Handle AM/PM format
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }
  
  return time;
}

// Display time in 24-hour format
export function displayTime24(time: string | undefined | null): string {
  const formatted = formatTime24(time);
  return formatted || "--:--";
}
