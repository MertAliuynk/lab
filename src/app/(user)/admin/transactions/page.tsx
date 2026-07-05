
"use client";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, FileText, User, Palette, MapPin } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { api } from "@/trpc/react";


export default function TransactionsPage() {
	const [selectedDentist, setSelectedDentist] = useState("");

	// Hekim listesini çek (önce tümünü çek, klinikId'yi ilk dentistten al)
	const dentistsQuery = api.admin.dentist.getAll.useQuery({ clinicId: undefined, perPage: 100 });
	const dentists = dentistsQuery.data || [];
   const clinicId = dentists[0]?.clinic?.id;

	// Sadece kendi kliniğinin hekimleri
	const filteredDentists = dentists.filter((d: any) => d.clinic && d.clinic.id === clinicId);

	// İşlemleri çek (sadece kendi kliniği)
	const dentalWorksQuery = api.admin.dentalWork.getAll.useQuery({ clinicId, dentistId: selectedDentist || undefined, perPage: 100 });
	const dentalWorks = dentalWorksQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">İşlemlerim</h1>
        <div className="w-full md:w-auto">
          <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
            <button
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${!selectedDentist ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              onClick={() => setSelectedDentist("")}
              type="button"
            >
              Tüm Hekimler
            </button>
            {filteredDentists.map((d: any) => (
              <button
                key={d.id || Math.random()}
                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm ${selectedDentist === d.id ? "bg-primary text-white border-primary ring-2 ring-primary/30" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                onClick={() => d.id && setSelectedDentist(d.id)}
                type="button"
                disabled={!d.user || !d.id}
              >
                {d.user && d.user.name ? d.user.name : "(İsimsiz Hekim)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {dentalWorks.length === 0 && (
          <div className="text-center text-gray-500 py-12">Kayıtlı işlem bulunamadı.</div>
        )}
        {dentalWorks.map((work: any) => {
          // Eğer iş tamamlandıysa, yüzde ve durum kesin olarak 100 ve 'Tamamlandı' olmalı
          const isCompleted = work.isCompleted === true;
          const progress = isCompleted ? 100 : (work.prosthesisStage?.percentage || 0);
          let totalPrice = work.totalPrice ? Number(work.totalPrice) : 0;
          if (work.dentalWorkAdditionalTreatments?.length) {
            const ekTedaviToplam = work.dentalWorkAdditionalTreatments.reduce((sum: number, add: any) => {
              const price = Number(add.price) || 0;
              return sum + price;
            }, 0);
            totalPrice += ekTedaviToplam;
          }
          return (
            <Card key={work.id} className="hover:shadow-md transition-shadow w-full">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{work.patient?.name}</h3>
                        <p className="text-sm text-gray-500">{work.prosthesisType?.name}</p>
                        <p className="text-xs text-gray-400">Hekim: {work.dentist?.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {work.selectedTeeth?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>Diş: {work.selectedTeeth.join(", ")}</span>
                        </div>
                      )}
                      {work.toothColor && (
                        <div className="flex items-center gap-1">
                          <Palette className="h-4 w-4" />
                          <span>{work.toothColor.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(work.createdAt), "dd.MM.yyyy", { locale: tr })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-6">
                    <div className="text-right min-w-[100px]">
                      <div className="flex items-center gap-2 mb-1">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 w-20" color={progress === 100 ? "green" : "primary"} />
                      {work.prosthesisStage && <p className="text-xs text-gray-500 mt-1">{work.prosthesisStage.name}</p>}
                    </div>
                    {totalPrice && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Toplam Tutar</p>
                        <p className="font-semibold text-green-600">₺{totalPrice.toLocaleString("tr-TR")}</p>
                      </div>
                    )}
                    <Badge variant={isCompleted ? "default" : "secondary"} className="ml-4">
                      {isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                    </Badge>
                  </div>
                </div>
                {work.dentalWorkAdditionalTreatments?.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2">
                    {work.dentalWorkAdditionalTreatments.map((add: any) => (
                      <div key={add.id} className="p-2 border rounded bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{add.additionalTreatment?.name || 'Ek Tedavi'}</span>
                          <span className="text-xs text-gray-500">Adet: {add.quantity || 1}</span>
                        </div>
                        {add.price !== null && (
                          <div className="text-xs text-green-700">₺{add.price?.toLocaleString('tr-TR')}</div>
                        )}
                        {add.notes && (
                          <div className="text-xs text-gray-600 mt-1">Not: {add.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {work.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">{work.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
