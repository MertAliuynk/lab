"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function DeliveryListPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [clinicId, setClinicId] = useState<string>("");
  const [dentistId, setDentistId] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const { data: clinics } = api.admin.clinic.getAll.useQuery({});
  const { data: dentists } = api.admin.dentist.getAll.useQuery({});

  const { data: result, isLoading } = api.laboratoryTechnician.dentalWork.getByDeliveryDate.useQuery(
    {
      date: selectedDate ?? new Date(),
      clinicId: clinicId || undefined,
      dentistId: dentistId || undefined,
      page: page,
      perPage: 20,
    },
    { enabled: !!selectedDate }
  );

  const dentalWorks = result?.dentalWorks || [];
  const pagination = result?.pagination;

  const goToPreviousDay = () => {
    if (!selectedDate) return;
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    setPage(1);
  };

  const goToNextDay = () => {
    if (!selectedDate) return;
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    setPage(1);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setPage(1);
  };

  if (!selectedDate) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teslim Tarihi Listesi</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={goToToday} variant="outline">
            Bugün
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: tr }) : "..."}
            </span>
          </div>
          <Button variant="outline" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-64">
          <Select value={clinicId || "all"} onValueChange={(val) => setClinicId(val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Şubeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Şubeler</SelectItem>
              {clinics?.map((clinic: any) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={dentistId || "all"} onValueChange={(val) => setDentistId(val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Doktorlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Doktorlar</SelectItem>
              {dentists?.map((dentist: any) => (
                <SelectItem key={dentist.id} value={dentist.id}>
                  {dentist.user?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">Yükleniyor...</CardContent>
          </Card>
        ) : dentalWorks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Bu tarihte teslim edilecek iş bulunmuyor.
            </CardContent>
          </Card>
        ) : (
          dentalWorks.map((work: any) => (
            <Card
              key={work.id}
              className={
                work.isCompleted
                  ? "border-2 border-gray-500 bg-gray-100"
                  : "border-2 border-orange-300 bg-orange-50/50"
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/teknisyen/hastalarim/${work.patient?.id}`}
                      className="hover:underline text-blue-600 transition-colors"
                    >
                      {work.patient?.name ?? "İsimsiz"}
                    </Link>
                    {" - " + (work.prosthesisType?.name ?? "-")}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      work.isCompleted
                        ? "border-gray-400 text-gray-700 bg-gray-50"
                        : "border-orange-200 text-orange-700 bg-orange-50"
                    }
                  >
                    {work.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-medium">Doktor:</span> {work.dentist?.user?.name || "-"}</div>
                  <div><span className="font-medium">Şube:</span> {work.dentist?.clinic?.name || "-"}</div>
                  <div>
                    <span className="font-medium">Teslim Tarihi:</span>{" "}
                    {work.deliveryDate ? format(new Date(work.deliveryDate), "dd MMM yyyy HH:mm", { locale: tr }) : "-"}
                  </div>
                  <div><span className="font-medium">Aşama:</span> {work.prosthesisStage?.name || "-"}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</Button>
          <span className="py-2 px-4 border rounded-md">Sayfa {page} / {pagination.totalPages}</span>
          <Button disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>Sonraki</Button>
        </div>
      )}
    </div>
  );
}