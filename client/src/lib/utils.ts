import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTime(input: number): string {
    const inputTime = new Date(input);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const inputDate = inputTime.toDateString();
    const todayDate = today.toDateString();
    const yesterdayDate = yesterday.toDateString();

    if (inputDate === todayDate) {
        // Return the time in "HH:mm" format
        const hours = String(inputTime.getHours()).padStart(2, "0");
        const minutes = String(inputTime.getMinutes()).padStart(2, "0");
        return `Today ${hours}:${minutes}`;
    } else if (inputDate === yesterdayDate) {
        return "yesterday";
    } else {
        // Return the date in "MM-DD-YYYY" format
        const month = String(inputTime.getMonth() + 1).padStart(2, "0");
        const day = String(inputTime.getDate()).padStart(2, "0");
        const year = inputTime.getFullYear();
        return `${month}-${day}-${year}`;
    }
}
