export {
    parseDate,
    dateOptions,
    parseDateToDateAndDay
}

var dateOptions = {
    era: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

function parseDate(date) {
    return date.getFullYear() + "-" + dateFormat(parseInt(date.getMonth() + 1) + "") + "-" + dateFormat(date.getDate());
}

function dateFormat(date) {
    return date.length === 1 ? "0" + date : date;
}

function parseDateToDateAndDay(date) {
    date = new Date(date);
    date = date.toLocaleString("ru", dateOptions).split(", ")[1].split(" ");
    date = date[0] + " " + date[1];
    return date;
}