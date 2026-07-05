"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

interface DateFilterProps {
	startDate?: Date;
	endDate?: Date;
	onStartDateChange: (date: Date | undefined) => void;
	onEndDateChange: (date: Date | undefined) => void;
	onClear: () => void;
}

export const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }: DateFilterProps) => {
	const [startOpen, setStartOpen] = useState(false);
	const [endOpen, setEndOpen] = useState(false);

	return (
		<div className="flex items-center gap-2">
			<Popover open={startOpen} onOpenChange={setStartOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn("w-[200px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{startDate ? format(startDate, "dd.MM.yyyy", { locale: tr }) : "Başlangıç tarihi"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={startDate}
						onSelect={(date) => {
							onStartDateChange(date);
							setStartOpen(false);
						}}
						initialFocus
						locale={tr}
					/>
				</PopoverContent>
			</Popover>

			<Popover open={endOpen} onOpenChange={setEndOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn("w-[200px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{endDate ? format(endDate, "dd.MM.yyyy", { locale: tr }) : "Bitiş tarihi"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={endDate}
						onSelect={(date) => {
							onEndDateChange(date);
							setEndOpen(false);
						}}
						initialFocus
						locale={tr}
						disabled={(date) => (startDate ? date < startDate : false)}
					/>
				</PopoverContent>
			</Popover>

			{(startDate || endDate) && (
				<Button variant="ghost" size="sm" onClick={onClear} className="h-9 px-2">
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
};
