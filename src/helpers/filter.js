export default function setFilterParams(filter) {
    let params = {
        filter: ""
    }, arrData;

    if (filter[0][0].active) {
        dateStart = new Date(filter[0][0].value).toISOString();
        params.dateStart = parseDate(new Date(dateStart));
    }

    if (filter[0][1].active) {
        dateEnd = new Date(filter[0][1].value).toISOString();
        params.dateEnd = parseDate(new Date(dateEnd));
    }

    arrData = getActiveOption(1, filter);
    if (arrData.length !== 0) params.locations = arrData;

    arrData = getActiveOption(2, filter);
    if (arrData.length !== 0) params.companions = arrData;

    arrData = getActiveOption(3, filter);
    if (arrData.length !== 0) params.subjects = arrData;

    if (filter[4][0].active) params.priceMin = parseInt(filter[4][0].value);

    if (filter[4][1].active) params.priceMax = parseInt(filter[4][1].value);

    return params;
}

function getActiveOption(category, filter) {
    var data = [];
    for (var i = 0; i < filter[category].length; i++) {
        if (filter[category][i].active) data.push(filter[category][i].id);
    }
    return data;
}