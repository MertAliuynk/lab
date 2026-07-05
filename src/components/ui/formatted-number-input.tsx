"use client";

import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
	value?: string | number;
	onChange?: (value: string | number) => void;
	returnType?: 'string' | 'number';
}

export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
	({ value, onChange, returnType = 'string', ...props }, ref) => {
		const formatNumber = (num: string | number) => {
			// Convert to string and clean
			const cleanNum = String(num).replace(/\D/g, '');
			if (!cleanNum) return '';
			
			// Sayıyı formatla (3 hanede bir nokta)
			return Number(cleanNum).toLocaleString('tr-TR');
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			// Sadece rakamları al
			const cleanValue = inputValue.replace(/\D/g, '');
			
			if (onChange) {
				if (returnType === 'number') {
					onChange(Number(cleanValue) || 0);
				} else {
					onChange(cleanValue);
				}
			}
		};

		// Display value'yu formatla
		const displayValue = value !== undefined && value !== null ? formatNumber(value) : '';

		return (
			<Input
				{...props}
				ref={ref}
				value={displayValue}
				onChange={handleChange}
				placeholder="0"
			/>
		);
	}
);

FormattedNumberInput.displayName = "FormattedNumberInput";