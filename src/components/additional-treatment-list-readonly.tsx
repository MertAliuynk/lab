import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ReadonlyAdditionalTreatment = {
  id: string;
  additionalTreatment: {
    name: string;
  };
  price?: number | null;
  notes?: string | null;
};

export default function AdditionalTreatmentListReadonly({ 
  treatments, 
  hidePrices = false 
}: { 
  treatments: ReadonlyAdditionalTreatment[];
  hidePrices?: boolean;
}) {
  if (!treatments || treatments.length === 0) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mb-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-green-700">
            Ek Tedaviler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">Henüz ek tedavi eklenmemiş.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mb-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-green-700">
          Ek Tedaviler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {treatments.map((treatment, index) => (
          <div
            key={`${treatment.id}-${index}`}
            className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {treatment.additionalTreatment.name}
                </span>
                {!hidePrices && treatment.price && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    ₺{treatment.price.toLocaleString('tr-TR')}
                  </Badge>
                )}
              </div>
              {treatment.notes && (
                <p className="text-xs text-gray-600 mt-1 ml-4">{treatment.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
