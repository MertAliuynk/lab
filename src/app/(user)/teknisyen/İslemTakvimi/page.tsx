"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function DeliveryListPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [clinicId, setClinicId] = useState<string>("");
  const [dentistId, setDentistId] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: clinics } = api.admin.clinic.getAll.useQuery({});
  const { data: dentists } = api.admin.dentist.getAll.useQuery({});

  // DÜZELTME: date parametresine .toISOString() yerine doğrudan Date nesnesi gönderiliyor
  const { data: result, isLoading } = api.laboratoryTechnician.dentalWork.getByDeliveryDate.useQuery({
    date: selectedDate, 
    clinicId: clinicId || undefined,
    dentistId: dentistId || undefined,
    page: page,
    perPage: 20,
  });

  const dentalWorks = result?.dentalWorks ?? [];
  const pagination = result?.pagination;

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setPage(1);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teslim Tarihi Listesi</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => changeDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => setSelectedDate(new Date())} variant="outline">
            Bugün
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {format(selectedDate, "dd MMMM yyyy", { locale: tr })}
            </span>
          </div>
          <Button variant="outline" onClick={() => changeDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-64">
          <Select value={clinicId} onValueChange={(val) => { setClinicId(val === "all" ? "" : val); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Şubeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Şubeler</SelectItem>
              {clinics?.map((clinic: any) => (
                <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <Select value={dentistId} onValueChange={(val) => { setDentistId(val === "all" ? "" : val); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Doktorlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Doktorlar</SelectItem>
              {dentists?.map((dentist: any) => (
                <SelectItem key={dentist.id} value={dentist.id}>{dentist.user?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center">Yükleniyor...</CardContent></Card>
        ) : dentalWorks.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Bu tarihte teslim edilecek iş bulunmuyor.</CardContent></Card>
        ) : (
          dentalWorks.map((work: any) => (
            <Card key={work.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{work.patient?.name} - {work.prosthesisType?.name}</CardTitle>
                  <Badge variant={work.isCompleted ? "default" : "secondary"}>
                    {work.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-medium">Doktor:</span> {work.dentist?.user?.name || "-"}</div>
                  <div><span className="font-medium">Şube:</span> {work.dentist?.clinic?.name || "-"}</div>
                  <div><span className="font-medium">Teslim Tarihi:</span> {work.deliveryDate ? format(new Date(work.deliveryDate), "dd MMM yyyy", { locale: tr }) : "-"}</div>
                  <div><span className="font-medium">Aşama:</span> {work.prosthesisStage?.name || "-"}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}