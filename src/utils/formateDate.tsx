interface DateFormatOptions {
  includeTime?: boolean;
  timeFormat?: '12h' | '24h';
}

function formatDate(dateString: string | undefined, options: DateFormatOptions = {}): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  if (options.includeTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    let formattedTime;
    if (options.timeFormat === '12h') {
      const hours12 = hours % 12;
      formattedTime = `${hours12 ? hours12 : 12}:${minutes}${ampm}`;
    } else {
      formattedTime = `${hours}:${minutes}`;
    }
    return `${day} ${month} ${year} / ${formattedTime}`;
  } else {
    return `${day} ${month} ${year}`;
  }
}

export default formatDate;