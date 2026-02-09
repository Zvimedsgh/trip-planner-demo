import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoDocumentPlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-lg border-2 border-blue-200">
        <CardContent className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            מסמך לדוגמה
          </h1>
          
          <div className="text-lg text-gray-600 leading-relaxed space-y-3">
            <p>
              כאן יוצגו המסמכים שתעלה לטיול שלך
            </p>
            <p className="text-base text-gray-500">
              תוכל לנסות זאת בטיול שתקים בעצמך
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              חזור לדף הבית
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
