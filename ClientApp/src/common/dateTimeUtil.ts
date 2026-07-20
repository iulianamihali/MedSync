import dayjs, {type Dayjs} from "dayjs";

const DateTimeFormat = {
    dayMonthYearFormat: (dateString?: string): string => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    },
    dayMonthYearTimeFormat: (dateString?: string): string => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    },
    timeFormat: (dateString? : string): string => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    appointmentDateFormat: (date?: Dayjs): string => {
        if (!date) return '';

        const day = date.date();
        const month = date.format('MMM'); // Jan, Feb, Mar
        const year = date.year();

        return `${day} ${month} ${year}`;
    },
    formatSummary: (date?: Dayjs): string => {
        if (!date) return '';
        const day = dayjs(date).format('dddd');
        const number = dayjs(date).date();
        const month = date.format('MMM'); // Jan, Feb, Mar
        return `${day}, ${number} ${month}`;
    }

};

export default DateTimeFormat;