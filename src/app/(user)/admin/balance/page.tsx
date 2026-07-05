
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function BalancePage() {
  // Klinik yöneticisinin kliniği (geçici: ilk dentistten al)
  const [selectedDentist, setSelectedDentist] = useState("");
  const dentistsQuery = api.admin.dentist.getAll.useQuery({ clinicId: undefined, perPage: 100 });
  const dentists = dentistsQuery.data || [];
  const clinicId = dentists[0]?.clinic?.id;

  // Klinik ödeme detayları
  const paymentDetailQuery = api.admin.payment.getClinicPaymentDetail.useQuery({ clinicId: clinicId || "" });
  const summary = paymentDetailQuery.data?.summary;
  const dentistSummaries = paymentDetailQuery.data?.dentistSummaries || [];

  // Filtrelenmiş hekimler
  const filteredDentists = selectedDentist ? dentistSummaries.filter((d: any) => d.id === selectedDentist) : dentistSummaries;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-center md:text-left">Güncel Toplam Bakiyem</h1>
        <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm w-full md:w-auto justify-center md:justify-start">
          <button
            className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${!selectedDentist ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
            onClick={() => setSelectedDentist("")}
            type="button"
          >
            Tüm Hekimler
          </button>
          {dentistSummaries.map((d: any) => (
            <button
              key={d.id}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${selectedDentist === d.id ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              onClick={() => setSelectedDentist(d.id)}
              type="button"
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-6 px-2 sm:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-base sm:text-lg font-semibold">Klinik Toplam Borç</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">₺{summary ? Number(summary.remainingDebt).toLocaleString("tr-TR") : "-"}</div>
            <div className="w-full max-w-md">
              <Progress value={summary?.paymentRate || 0} className="h-2" color={summary?.paymentRate === 100 ? "green" : "primary"} />
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 mt-1 gap-1 sm:gap-0">
                <span>Ödenen: ₺{summary ? Number(summary.totalReceived).toLocaleString("tr-TR") : "-"}</span>
                <span>Borç: ₺{summary ? Number(summary.totalDebt).toLocaleString("tr-TR") : "-"}</span>
                <span>%{summary?.paymentRate || 0} ödendi</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {filteredDentists.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">Kayıtlı hekim borcu bulunamadı.</div>
        )}
        {filteredDentists.map((dentist: any) => (
          <Card key={dentist.id} className="hover:shadow-md transition-shadow w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-semibold text-base sm:text-lg">{dentist.name}</span>
                  <Badge variant={dentist.remainingDebt > 0 ? "destructive" : "default"}>
                    {dentist.remainingDebt > 0 ? "Borçlu" : "Ödendi"}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <div className="text-sm text-gray-500">Toplam Borç:</div>
                  <div className="font-bold text-red-600 text-base sm:text-lg">₺{Number(dentist.remainingDebt).toLocaleString("tr-TR")}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="text-xs text-gray-500">Ödenen: ₺{Number(dentist.totalReceived).toLocaleString("tr-TR")}</div>
                  <div className="text-xs text-gray-500">Borç: ₺{Number(dentist.totalDebt).toLocaleString("tr-TR")}</div>
                  <div className="text-xs text-gray-500">%{dentist.paymentRate} ödendi</div>
                </div>
                <Progress value={dentist.paymentRate} className="h-1.5 mt-2" color={dentist.paymentRate === 100 ? "green" : "primary"} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
