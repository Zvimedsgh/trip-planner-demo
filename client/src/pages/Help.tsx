import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, BookOpen, Plane, Hotel, Map, FileText, Users, DollarSign, Share2 } from "lucide-react";

export default function Help() {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  const t = (en: string, he: string) => (isHebrew ? he : en);

  const sections = [
    {
      icon: <Plane className="h-6 w-6" />,
      title: t("Getting Started", "התחלת עבודה"),
      content: t(
        "Learn how to install the app on iPhone and Android, create your first trip, and navigate the interface.",
        "למד כיצד להתקין את האפליקציה על iPhone ו-Android, ליצור את הטיול הראשון שלך ולנווט בממשק."
      ),
    },
    {
      icon: <Hotel className="h-6 w-6" />,
      title: t("Hotels & Transportation", "מלונות ותחבורה"),
      content: t(
        "Manage hotel bookings, flights, trains, car rentals, and all transportation details in one place.",
        "נהל הזמנות מלונות, טיסות, רכבות, רכב שכור וכל פרטי התחבורה במקום אחד."
      ),
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: t("Routes & Maps", "מסלולים ומפות"),
      content: t(
        "Plan daily routes with interactive Google Maps, discover POIs, and save favorite places to Must Visit.",
        "תכנן מסלולים יומיים עם מפות אינטראקטיביות של Google Maps, גלה נקודות עניין ושמור מקומות מועדפים ל-Must Visit."
      ),
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: t("Documents", "מסמכים"),
      content: t(
        "Upload and organize passports, visas, bookings, tickets, and all important travel documents.",
        "העלה וארגן דרכונים, ויזות, אישורי הזמנה, כרטיסים וכל המסמכים החשובים לטיול."
      ),
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t("Travelers & Checklist", "משתתפים וצ'קליסט"),
      content: t(
        "Manage trip participants and track pre-trip tasks with an organized checklist for each traveler.",
        "נהל משתתפים בטיול ועקוב אחר משימות לפני הטיול עם רשימת מטלות מסודרת לכל נוסע."
      ),
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: t("Budget & Payments", "תקציב ותשלומים"),
      content: t(
        "Track expenses, mark payments as paid/unpaid, and view budget summaries by currency.",
        "עקוב אחר הוצאות, סמן תשלומים כשולם/לא שולם וצפה בסיכומי תקציב לפי מטבע."
      ),
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: t("Sharing & Collaboration", "שיתוף ושיתוף פעולה"),
      content: t(
        "Share trips with other travelers via WhatsApp or email. Collaborators can view and edit all trip details.",
        "שתף טיולים עם נוסעים נוספים דרך וואטסאפ או אימייל. משתפי פעולה יכולים לצפות ולערוך את כל פרטי הטיול."
      ),
    },
  ];

  const downloadPDF = () => {
    window.open("/user-guide.pdf", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("User Guide", "מדריך משתמש")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t(
              "Everything you need to know about Trip Planner Pro - from installation to advanced features.",
              "כל מה שאתה צריך לדעת על Trip Planner Pro - מהתקנה ועד תכונות מתקדמות."
            )}
          </p>
          <Button onClick={downloadPDF} size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            {t("Download PDF Guide", "הורד מדריך PDF")}
          </Button>
        </div>

        {/* Quick Start Guide */}
        <Card className="p-8 mb-12 border-2 border-blue-200 bg-blue-50/50">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Plane className="h-7 w-7 text-blue-600" />
            {t("Quick Start", "התחלה מהירה")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🍎 {t("iPhone Installation", "התקנה על iPhone")}
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>{t("Open the app link in Safari", "פתח את קישור האפליקציה ב-Safari")}</li>
                <li>{t("Tap the Share button (bottom center)", "לחץ על כפתור Share (למטה באמצע)")}</li>
                <li>{t('Select "Add to Home Screen"', 'בחר "Add to Home Screen"')}</li>
                <li>{t('Tap "Add" - app icon will appear', 'לחץ "Add" - אייקון האפליקציה יופיע')}</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🤖 {t("Android Installation", "התקנה על Android")}
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>{t("Open the app link in Chrome", "פתח את קישור האפליקציה ב-Chrome")}</li>
                <li>{t("Tap the menu (3 dots)", "לחץ על התפריט (3 נקודות)")}</li>
                <li>{t('Select "Add to Home screen"', 'בחר "הוסף למסך הבית"')}</li>
                <li>{t('Tap "Add" - app icon will appear', 'לחץ "הוסף" - אייקון האפליקציה יופיע')}</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Key Features */}
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
          <h2 className="text-2xl font-bold mb-6 text-center">{t("Key Features", "תכונות עיקריות")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">✈️</div>
              <h4 className="font-semibold mb-1">{t("All-in-One Planning", "תכנון הכל במקום אחד")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Hotels, flights, routes, restaurants, and documents",
                  "מלונות, טיסות, מסלולים, מסעדות ומסמכים"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <h4 className="font-semibold mb-1">{t("Interactive Maps", "מפות אינטראקטיביות")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Google Maps integration with POIs and directions",
                  "אינטגרציה עם Google Maps עם נקודות עניין וניווט"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <h4 className="font-semibold mb-1">{t("Real-time Collaboration", "שיתוף פעולה בזמן אמת")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Share trips and collaborate with other travelers",
                  "שתף טיולים ושתף פעולה עם נוסעים נוספים"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h4 className="font-semibold mb-1">{t("Budget Tracking", "מעקב אחר תקציב")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Multi-currency support with automatic conversion",
                  "תמיכה במספר מטבעות עם המרה אוטומטית"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <h4 className="font-semibold mb-1">{t("Works Everywhere", "עובד בכל מקום")}</h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Phone, tablet, computer - syncs automatically",
                  "טלפון, טאבלט, מחשב - מסתנכרן אוטומטית"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌐</div>
              <h4 className="font-semibold mb-1">{t("Multilingual", "רב לשוני")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("Full support for Hebrew and English", "תמיכה מלאה בעברית ובאנגלית")}
              </p>
            </div>
          </div>
        </Card>

        {/* Download CTA */}
        <div className="text-center mt-12">
          <Button onClick={downloadPDF} size="lg" variant="outline" className="gap-2">
            <Download className="h-5 w-5" />
            {t("Download Complete PDF Guide", "הורד מדריך PDF מלא")}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {t(
              "The PDF guide includes detailed instructions, screenshots, and tips for all features.",
              "מדריך ה-PDF כולל הוראות מפורטות, צילומי מסך וטיפים לכל התכונות."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
