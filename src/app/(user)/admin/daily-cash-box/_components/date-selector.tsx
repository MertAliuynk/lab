"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Calculator, ChevronLeft, ChevronRight, Dot } from "lucide-react";

interface DateSelectorProps {
   selectedDate: Date;
   onDateChange: (date: Date) => void;
   onCashBoxSummary: () => void;
}

export default function DateSelector({ selectedDate, onDateChange, onCashBoxSummary }: DateSelectorProps) {
	const formatDate = (date: Date) => {
		return format(date, "d MMMM yyyy", { locale: tr });
	};

	// Yardımcı fonksiyonlar
	const addDays = (date: Date, days: number) => {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	};

	const isToday = (date: Date) => {
		const now = new Date();
		return (
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		);
	};

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				{/* Önceki gün butonu */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDateChange(addDays(selectedDate, -1))}
					title="Önceki gün"
				>
					<ChevronLeft className="h-5 w-5" />
				</Button>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="w-[220px] justify-start text-left font-normal">
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formatDate(selectedDate)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={(date) => date && onDateChange(date)}
							initialFocus
							locale={tr}
						/>
					</PopoverContent>
				</Popover>

				{/* Sonraki gün butonu */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDateChange(addDays(selectedDate, 1))}
					title="Sonraki gün"
				>
					<ChevronRight className="h-5 w-5" />
				</Button>

				{/* Bugün butonu */}
				<Button
					variant={isToday(selectedDate) ? "secondary" : "outline"}
					onClick={() => onDateChange(new Date())}
					className="flex items-center gap-1"
				>
					<Dot className="h-5 w-5 text-green-500" />
					Bugün
				</Button>

				<Button 
					variant="outline" 
					onClick={onCashBoxSummary}
					className="flex items-center gap-2"
				>
					<Calculator className="h-4 w-4" />
					Kasa Detayı
				</Button>
			</div>
		</div>
	);
}
