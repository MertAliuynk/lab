"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { api } from "@/trpc/react";



export default function PaymentHistoryPage() {
  const [selectedDentist, setSelectedDentist] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

	// Hekim listesini çek (önce tümünü çek, klinikId'yi ilk dentistten al)
	const dentistsQuery = api.admin.dentist.getAll.useQuery({ clinicId: undefined, perPage: 100 });
	const dentists = dentistsQuery.data || [];
  const clinicId = dentists[0]?.clinic?.id;

	// Sadece kendi kliniğinin hekimleri
	const filteredDentists = dentists.filter((d: any) => d.clinic && d.clinic.id === clinicId);

  // Gelirleri çek (sadece kendi kliniği)
  const incomesQuery = api.admin.payment.getClinicPaymentDetail.useQuery({ clinicId: clinicId || "" });
  const allIncomes = incomesQuery.data?.incomes || [];

  // Filtrelenmiş gelirler
  const filteredIncomes = allIncomes.filter((income: any) => {
    const dentistMatch = !selectedDentist || income.dentistId === selectedDentist;
    const date = income.date ? new Date(income.date) : null;
    const fromMatch = !dateFrom || (date && date >= new Date(dateFrom));
    const toMatch = !dateTo || (date && date <= new Date(dateTo));
    return dentistMatch && fromMatch && toMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Ödeme Geçmişi</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Hekim filtre kutusu */}
          <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm w-full sm:w-auto">
            <button
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${!selectedDentist ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              onClick={() => setSelectedDentist("")}
              type="button"
            >
              Tüm Hekimler
            </button>
            {filteredDentists.map((d: any) => (
              <button
                key={d.id}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${selectedDentist === d.id ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                onClick={() => setSelectedDentist(d.id)}
                type="button"
              >
                {d.user?.name}
              </button>
            ))}
          </div>
          {/* Tarih filtre kutusu */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">Tarih:</label>
            <div className="flex flex-col xs:flex-row gap-2 w-full">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-full min-w-0"
                max={dateTo || undefined}
              />
              <span className="mx-1 text-gray-400 hidden xs:inline">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-full min-w-0"
                min={dateFrom || undefined}
              />
            </div>
          </div>
        </div>
      </div>
      {!clinicId && (
        <div className="text-center text-red-500 py-4">Klinik seçilemedi, lütfen bir klinik yöneticisiyle giriş yapın.</div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {filteredIncomes.length === 0 && (
          <div className="text-center text-gray-500 py-12">Kayıtlı gelir bulunamadı.</div>
        )}
        {filteredIncomes.map((income: any) => (
          <Card key={income.id} className="hover:shadow-md transition-shadow w-full">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {income.paymentType === "CASH" ? "Nakit" : income.paymentType === "CREDIT_CARD" ? "Kredi Kartı" : income.paymentType === "BANK_TRANSFER" ? "Havale" : income.paymentType}
                  </Badge>
                  <span className="font-semibold text-green-700 text-lg">₺{Number(income.amount).toLocaleString("tr-TR")}</span>
                </div>
                {income.description && <div className="text-sm text-gray-600">{income.description}</div>}
                {income.dentist && (
                  <div className="text-xs text-gray-500">👨‍⚕️ {income.dentist.user?.name}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Calendar className="h-4 w-4" />
                  <span>{income.date ? format(new Date(income.date), "dd.MM.yyyy", { locale: tr }) : "-"}</span>
                </div>
                <div className="text-xs text-gray-400">Kayıt: {income.createdBy?.name || "-"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
