export {
    parseDate
}

function parseDate(date){
    return date.getFullYear() + "-" + dateFormat(parseInt(date.getMonth() + 1) + "") + "-" + dateFormat(date.getDate());
}

function dateFormat(date){
    return date.length === 1 ? "0" + date : date;
}