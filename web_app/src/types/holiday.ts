export interface Holiday {
  dateName: string;
  locDate: string;
}

export interface HolidayResponse {
  error?: string;
  holidays: Holiday[];
}
