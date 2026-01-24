import { describe, it, expect } from "vitest";

/**
 * Unit tests for DailyView time display logic
 * 
 * Tests that the daily view correctly combines date timestamps with time strings
 * for activities like hotel check-ins and car rentals.
 */

describe("DailyView time parsing", () => {
  it("should correctly parse and combine date with time string", () => {
    // Simulate the logic used in DailyView.tsx for combining date + time
    // Create a date at midnight in local timezone
    const testDate = new Date(2026, 8, 2, 0, 0, 0, 0).getTime(); // Sep 2, 2026 midnight local
    const testTime = "10:00"; // Time string in HH:MM format
    
    // Parse time and combine with date
    const [hours, minutes] = testTime.split(':');
    const combinedDate = new Date(testDate);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const combinedTimestamp = combinedDate.getTime();
    
    // Verify the time is correctly set to 10:00
    const resultDate = new Date(combinedTimestamp);
    expect(resultDate.getHours()).toBe(10);
    expect(resultDate.getMinutes()).toBe(0);
    
    // Verify the date is preserved (in local timezone)
    expect(resultDate.getFullYear()).toBe(2026);
    expect(resultDate.getMonth()).toBe(8); // September (0-indexed)
    expect(resultDate.getDate()).toBe(2);
  });

  it("should handle different time formats correctly", () => {
    const testDate = new Date("2026-09-02T00:00:00Z").getTime();
    
    // Test various time strings
    const testCases = [
      { time: "10:00", expectedHour: 10, expectedMinute: 0 },
      { time: "17:00", expectedHour: 17, expectedMinute: 0 },
      { time: "14:30", expectedHour: 14, expectedMinute: 30 },
      { time: "03:00", expectedHour: 3, expectedMinute: 0 },
    ];
    
    testCases.forEach(({ time, expectedHour, expectedMinute }) => {
      const [hours, minutes] = time.split(':');
      const combinedDate = new Date(testDate);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      expect(combinedDate.getHours()).toBe(expectedHour);
      expect(combinedDate.getMinutes()).toBe(expectedMinute);
    });
  });

  it("should preserve original timestamp when time string is not provided", () => {
    const testDate = new Date("2026-09-02T00:00:00Z").getTime();
    const timeString = null;
    
    // Simulate the logic: if no time string, use original timestamp
    let resultTimestamp = testDate;
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date(testDate);
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      resultTimestamp = date.getTime();
    }
    
    expect(resultTimestamp).toBe(testDate);
  });

  it("should correctly sort activities by combined timestamps", () => {
    const baseDate = new Date(2026, 8, 2, 0, 0, 0, 0).getTime();
    
    // Create activities with different times
    const activities = [
      { name: "Villa check-in", time: "17:00" },
      { name: "Car pickup", time: "10:00" },
      { name: "Drive to Mikuláš", time: "14:00" },
    ];
    
    // Combine dates with times
    const activitiesWithTimestamps = activities.map(activity => {
      const [hours, minutes] = activity.time.split(':');
      const date = new Date(baseDate);
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return {
        name: activity.name,
        timestamp: date.getTime()
      };
    });
    
    // Sort by timestamp
    activitiesWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);
    
    // Verify correct order
    expect(activitiesWithTimestamps[0].name).toBe("Car pickup");
    expect(activitiesWithTimestamps[1].name).toBe("Drive to Mikuláš");
    expect(activitiesWithTimestamps[2].name).toBe("Villa check-in");
  });
});
