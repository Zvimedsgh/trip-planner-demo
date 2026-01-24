export type Language = "en" | "he";

export const translations = {
  en: {
    // General
    appName: "Trip Planner Pro",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    back: "Back",
    search: "Search",
    noResults: "No results found",
    confirmDelete: "Are you sure you want to delete this?",
    yes: "Yes",
    no: "No",
    
    // Auth
    login: "Login",
    logout: "Logout",
    welcome: "Welcome",
    loginToStart: "Login to start planning your trips",
    
    // Navigation
    home: "Home",
    myTrips: "My Trips",
    timeline: "Timeline",
    budget: "Budget",
    documents: "Documents",
    settings: "Settings",
    
    // Trips
    trips: "Trips",
    newTrip: "New Trip",
    editTrip: "Edit Trip",
    tripName: "Trip Name",
    destination: "Destination",
    startDate: "Start Date",
    endDate: "End Date",
    description: "Description",
    noTrips: "No trips yet. Create your first trip!",
    tripDetails: "Trip Details",
    
    // Tourist Sites
    touristSites: "Tourist Sites",
    newSite: "New Site",
    siteName: "Site Name",
    address: "Address",
    openingHours: "Opening Hours",
    plannedVisitDate: "Planned Visit Date",
    notes: "Notes",
    noSites: "No tourist sites added yet",
    
    // Hotels
    hotels: "Hotels",
    newHotel: "New Hotel",
    hotelName: "Hotel Name",
    checkIn: "Check-in",
    checkOut: "Check-out",
    confirmationNumber: "Confirmation Number",
    price: "Price",
    currency: "Currency",
    noHotels: "No hotels booked yet",
    
    // Transportation
    transportation: "Transportation",
    newTransportation: "New Transportation",
    transportType: "Type",
    flight: "Flight",
    train: "Train",
    bus: "Bus",
    ferry: "Ferry",
    other: "By Car",
    origin: "Origin",
    departureDate: "Departure Date",
    arrivalDate: "Arrival Date",
    noTransportation: "No transportation added yet",
    
    // Car Rentals
    carRentals: "Car Rentals",
    newCarRental: "New Car Rental",
    company: "Company",
    carModel: "Car Model",
    pickupDate: "Pickup Date",
    returnDate: "Return Date",
    pickupLocation: "Pickup Location",
    returnLocation: "Return Location",
    noCarRentals: "No car rentals added yet",
    
    // Restaurants
    restaurants: "Restaurants",
    newRestaurant: "New Restaurant",
    restaurantName: "Restaurant Name",
    cuisineType: "Cuisine Type",
    reservationDate: "Reservation Date",
    numberOfDiners: "Number of Diners",
    noRestaurants: "No restaurants saved yet",
    
    // Documents
    uploadDocument: "Upload Document",
    documentName: "Document Name",
    category: "Category",
    passport: "Passport",
    visa: "Visa",
    insurance: "Insurance",
    booking: "Booking",
    ticket: "Ticket",
    tags: "Tags",
    noDocuments: "No documents uploaded yet",
    
    // Day Trips
    dayTrips: "Day Trips",
    newDayTrip: "New Day Trip",
    createDayTrip: "Create Day Trip",
    dayTripCreated: "Day trip created successfully",
    dayTripDeleted: "Day trip deleted successfully",
    dayTripNamePlaceholder: "e.g., Bratislava to Liptovský Mikuláš",
    dayTripDescriptionPlaceholder: "Brief description of the day trip",
    startLocation: "Start Location",
    endLocation: "End Location",
    startLocationPlaceholder: "e.g., Bratislava",
    endLocationPlaceholder: "e.g., Liptovský Mikuláš",
    startTime: "Start Time",
    endTime: "End Time",
    stops: "Stops & Attractions",
    stopsPlaceholder: "List stops, attractions, restaurants, gas stations (one per line)",
    notesPlaceholder: "Additional notes or recommendations",
    noDayTrips: "No day trips yet. Create one to get started!",
    
    // Budget
    totalBudget: "Total Budget",
    hotelsCost: "Hotels",
    transportationCost: "Transportation",
    carRentalsCost: "Car Rentals",
    totalCost: "Total Cost",
    
    // Timeline
    timelineView: "Timeline View",
    allActivities: "All Activities",
    
    // Language
    language: "Language",
    english: "English",
    hebrew: "עברית",
    
    // Dates
    days: "days",
    today: "Today",
    tomorrow: "Tomorrow",
    
    // Hero section
    heroTitle: "Plan Your Perfect Trip",
    heroSubtitle: "Organize destinations, hotels, transportation, and more in one elegant place",
    getStarted: "Get Started",
    
    // Features
    features: "Features",
    featureTrips: "Trip Management",
    featureTripsDesc: "Create and organize multiple trips with all details in one place",
    featureSites: "Tourist Sites",
    featureSitesDesc: "Save and plan visits to attractions and landmarks",
    featureHotels: "Hotel Bookings",
    featureHotelsDesc: "Keep track of all your accommodation reservations",
    featureTransport: "Transportation",
    featureTransportDesc: "Manage flights, trains, and other travel arrangements",
    featureCars: "Car Rentals",
    featureCarDesc: "Organize rental car bookings and details",
    featureRestaurants: "Restaurants",
    featureRestaurantsDesc: "Save restaurant recommendations and reservations",
    featureDocs: "Documents",
    featureDocsDesc: "Store important travel documents securely",
    featureBudget: "Budget Tracking",
    featureBudgetDesc: "Monitor expenses and stay within budget",
  },
  he: {
    // General
    appName: "מתכנן הטיולים",
    loading: "טוען...",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    add: "הוסף",
    create: "צור",
    back: "חזור",
    search: "חיפוש",
    noResults: "לא נמצאו תוצאות",
    confirmDelete: "האם אתה בטוח שברצונך למחוק?",
    yes: "כן",
    no: "לא",
    
    // Auth
    login: "התחברות",
    logout: "התנתקות",
    welcome: "ברוך הבא",
    loginToStart: "התחבר כדי להתחיל לתכנן את הטיולים שלך",
    
    // Navigation
    home: "בית",
    myTrips: "הטיולים שלי",
    timeline: "ציר זמן",
    budget: "תקציב",
    documents: "מסמכים",
    settings: "הגדרות",
    
    // Trips
    trips: "טיולים",
    newTrip: "טיול חדש",
    editTrip: "עריכת טיול",
    tripName: "שם הטיול",
    destination: "יעד",
    startDate: "תאריך התחלה",
    endDate: "תאריך סיום",
    description: "תיאור",
    noTrips: "אין טיולים עדיין. צור את הטיול הראשון שלך!",
    tripDetails: "פרטי הטיול",
    
    // Tourist Sites
    touristSites: "אתרי תיירות",
    newSite: "אתר חדש",
    siteName: "שם האתר",
    address: "כתובת",
    openingHours: "שעות פתיחה",
    plannedVisitDate: "תאריך ביקור מתוכנן",
    notes: "הערות",
    noSites: "לא נוספו אתרי תיירות עדיין",
    
    // Hotels
    hotels: "מלונות",
    newHotel: "מלון חדש",
    hotelName: "שם המלון",
    checkIn: "צ'ק-אין",
    checkOut: "צ'ק-אאוט",
    confirmationNumber: "מספר אישור",
    price: "מחיר",
    currency: "מטבע",
    noHotels: "לא הוזמנו מלונות עדיין",
    
    // Transportation
    transportation: "הסעות",
    newTransportation: "הסעה חדשה",
    transportType: "סוג",
    flight: "טיסה",
    train: "רכבת",
    bus: "אוטובוס",
    ferry: "מעבורת",
    other: "ברכב",
    origin: "מוצא",
    departureDate: "תאריך יציאה",
    arrivalDate: "תאריך הגעה",
    noTransportation: "לא נוספו הסעות עדיין",
    
    // Car Rentals
    carRentals: "השכרת רכב",
    newCarRental: "השכרה חדשה",
    company: "חברה",
    carModel: "דגם הרכב",
    pickupDate: "תאריך איסוף",
    returnDate: "תאריך החזרה",
    pickupLocation: "מיקום איסוף",
    returnLocation: "מיקום החזרה",
    noCarRentals: "לא נוספו השכרות רכב עדיין",
    
    // Restaurants
    restaurants: "מסעדות",
    newRestaurant: "מסעדה חדשה",
    restaurantName: "שם המסעדה",
    cuisineType: "סוג מטבח",
    reservationDate: "תאריך הזמנה",
    numberOfDiners: "מספר סועדים",
    noRestaurants: "לא נשמרו מסעדות עדיין",
    
    // Documents
    uploadDocument: "העלאת מסמך",
    documentName: "שם המסמך",
    category: "קטגוריה",
    passport: "דרכון",
    visa: "ויזה",
    insurance: "ביטוח",
    booking: "הזמנה",
    ticket: "כרטיס",
    tags: "תגיות",
    noDocuments: "לא הועלו מסמכים עדיין",
    
    // Day Trips
    dayTrips: "טיולי יום",
    newDayTrip: "טיול יום חדש",
    createDayTrip: "יצירת טיול יום",
    dayTripCreated: "טיול היום נוצר בהצלחה",
    dayTripDeleted: "טיול היום נמחק בהצלחה",
    dayTripNamePlaceholder: "לדוגמה, ברטיסלבה לליפטובסקי מיקולש",
    dayTripDescriptionPlaceholder: "תיאור קצר של טיול היום",
    startLocation: "מיקום התחלה",
    endLocation: "יעד",
    startLocationPlaceholder: "לדוגמה, ברטיסלבה",
    endLocationPlaceholder: "לדוגמה, ליפטובסקי מיקולש",
    startTime: "שעת התחלה",
    endTime: "שעת סיום",
    stops: "תחנות ואתרים",
    stopsPlaceholder: "רשימת תחנות, אתרים, מסעדות, תחנות דלק (אחד בכל שורה)",
    notesPlaceholder: "הערות או המלצות נוספות",
    noDayTrips: "אין טיולי יום עדיין. צור אחד כדי להתחיל!",
    
    // Budget
    totalBudget: "סה״כ תקציב",
    hotelsCost: "מלונות",
    transportationCost: "הסעות",
    carRentalsCost: "השכרת רכב",
    totalCost: "עלות כוללת",
    
    // Timeline
    timelineView: "תצוגת ציר זמן",
    allActivities: "כל הפעילויות",
    
    // Language
    language: "שפה",
    english: "English",
    hebrew: "עברית",
    
    // Dates
    days: "ימים",
    today: "היום",
    tomorrow: "מחר",
    
    // Hero section
    heroTitle: "תכנן את הטיול המושלם",
    heroSubtitle: "ארגן יעדים, מלונות, הסעות ועוד במקום אחד אלגנטי",
    getStarted: "התחל עכשיו",
    
    // Features
    features: "תכונות",
    featureTrips: "ניהול טיולים",
    featureTripsDesc: "צור וארגן טיולים מרובים עם כל הפרטים במקום אחד",
    featureSites: "אתרי תיירות",
    featureSitesDesc: "שמור ותכנן ביקורים באטרקציות ואתרים",
    featureHotels: "הזמנות מלון",
    featureHotelsDesc: "עקוב אחר כל הזמנות הלינה שלך",
    featureTransport: "הסעות",
    featureTransportDesc: "נהל טיסות, רכבות וסידורי נסיעה אחרים",
    featureCars: "השכרת רכב",
    featureCarDesc: "ארגן הזמנות והשכרות רכב",
    featureRestaurants: "מסעדות",
    featureRestaurantsDesc: "שמור המלצות והזמנות למסעדות",
    featureDocs: "מסמכים",
    featureDocsDesc: "אחסן מסמכי נסיעה חשובים בצורה מאובטחת",
    featureBudget: "מעקב תקציב",
    featureBudgetDesc: "עקוב אחר הוצאות והישאר בתקציב",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.en[key] || key;
}
