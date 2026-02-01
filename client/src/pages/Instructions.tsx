import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, UserPlus, Map, FileText, Calendar } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Instructions() {
  const { language } = useLanguage();

  const steps = language === "he" ? [
    {
      icon: LogIn,
      title: "התחבר או הירשם",
      description: "לחץ על כפתור 'התחבר' בפינה הימנית העליונה. אם אין לך חשבון, תוכל ליצור אחד בקלות."
    },
    {
      icon: Map,
      title: "צפה בפרטי הטיול",
      description: "לאחר ההתחברות, תוכל לראות את כל פרטי הטיול: מלונות, תחבורה, מסעדות ואתרי תיירות."
    },
    {
      icon: Calendar,
      title: "בדוק את רשימת המשימות",
      description: "עבור ללשונית 'רשימת משימות' כדי לראות מה צריך להכין לפני הטיול."
    },
    {
      icon: FileText,
      title: "העלה מסמכים",
      description: "העלה מסמכים חשובים כמו כרטיסי טיסה, אישורי הזמנה וביטוח נסיעות."
    }
  ] : [
    {
      icon: LogIn,
      title: "Sign In or Sign Up",
      description: "Click the 'Sign In' button in the top right corner. If you don't have an account, you can create one easily."
    },
    {
      icon: Map,
      title: "View Trip Details",
      description: "After signing in, you'll see all trip details: hotels, transportation, restaurants, and tourist sites."
    },
    {
      icon: Calendar,
      title: "Check Your Checklist",
      description: "Go to the 'Checklist' tab to see what you need to prepare before the trip."
    },
    {
      icon: FileText,
      title: "Upload Documents",
      description: "Upload important documents like flight tickets, booking confirmations, and travel insurance."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {language === "he" ? "ברוכים הבאים לטיול שלנו!" : "Welcome to Our Trip!"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === "he" 
              ? "הוזמנת להצטרף לטיול. עקוב אחר ההוראות הפשוטות הבאות כדי להתחיל:"
              : "You've been invited to join a trip. Follow these simple steps to get started:"
            }
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {language === "he" ? ["א", "ב", "ג", "ד"][index] : index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === "he" ? "מוכנים להתחיל?" : "Ready to Get Started?"}
            </h2>
            <p className="mb-6 text-white/90">
              {language === "he"
                ? "התחבר עכשיו כדי לראות את כל פרטי הטיול ולהתחיל להתכונן!"
                : "Sign in now to see all trip details and start preparing!"
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {language === "he" ? "התחבר" : "Sign In"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.location.href = "/"}
              >
                {language === "he" ? "חזור לדף הבית" : "Back to Home"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            {language === "he"
              ? "צריך עזרה? צור קשר עם מארגן הטיול."
              : "Need help? Contact the trip organizer."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
