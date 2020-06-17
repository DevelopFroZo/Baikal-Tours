import { parseDate } from "./parsers.js";

export {
    parseFilterDataForAdmin,
    parseFilterData,
    setFilterData,
    setFilterFromUrl,
    showActiveFilters,
    parseFilterDataForHotels,
    setNewLocationsData
}

function setFilterData(res) {
    let data = [];

    for (let i = 0; i < res.length; i++) {
        data.push({
            id: res[i].id,
            value: res[i].name,
            active: false
        });
    }

    return data;
}

function setNewLocationsData(locations){
    let data = [];
    for(let location of locations){
        location.value = location.name;
        delete location.name;
        data.push({
            ...location,
            active: false
        })
    }
    
    return data;
}

function parseFilterData(filter) {
    let params = {
        filter: "",
    },
        compiliationsParams = {
            filter: "",
        },
        arrData, dateStart, dateEnd;

    if (filter[0][0].active) {
        dateStart = new Date(filter[0][0].value).toISOString();
        params.dateStart = parseDate(new Date(dateStart));
        compiliationsParams.dateStart = parseDate(new Date(dateStart));
    }

    if (filter[0][1].active) {
        dateEnd = new Date(filter[0][1].value).toISOString();
        params.dateEnd = parseDate(new Date(dateEnd));
        compiliationsParams.dateEnd = parseDate(new Date(dateEnd));
    }

    arrData = getActiveOption(filter[1]);
    if (arrData.length !== 0) {
        params.locations = arrData;
        compiliationsParams.locationIds = arrData;
    }

    arrData = getActiveOption(filter[2]);
    if (arrData.length !== 0)
        params.companions = arrData;

    arrData = getActiveOption(filter[3]);
    if (arrData.length !== 0) {
        params.subjects = arrData;
        compiliationsParams.subjectIds = arrData;
    }

    if (filter[4][0].active) params.priceMin = parseInt(filter[4][0].value);

    if (filter[4][1].active) params.priceMax = parseInt(filter[4][1].value);

    return { params, compiliationsParams };
}

function parseFilterDataForAdmin(filter) {

    let params = {
        filter: "",
        allStatuses: ""
    }, arrData;

    if (filter.search.active || filter.search.value.length){
        params.search = encodeURIComponent(filter.search.value);
        filter.search.active = true;
    }

    arrData = getActiveOption(filter.subjects)
    if (arrData.length !== 0) params.subjects = arrData;

    arrData = getActiveOption(filter.locations);
    if (arrData.length !== 0) params.locations = arrData;

    return params;
}

function parseFilterDataForHotels(filter) {

    let params = { filter: "" };
    let arrData;

    if (filter.search.active || filter.search.value.length > 0) params.search = encodeURIComponent(filter.search.value);

    arrData = getActiveOption(filter.bookingLocationIds);
    if (arrData.length) params.bookingLocationIds = arrData;

    if(Object.keys(params).length === 1)
        params = {};

    return params;
}

function getActiveOption(filter) {
    var data = [];
    for (var i = 0; i < filter.length; i++) {
        if (filter[i].active) data.push(filter[i].id);
    }
    return data;
}

function setFilterFromUrl(params, filter) {
    for (let i = 0; i < params.length; i++) {
        for (let j = 0; j < filter.length; j++) {
            if (parseInt(params[i]) === filter[j].id) {
                filter[j].active = true;
                break;
            }
        }
    }

    return filter;
}

function showActiveFilters(filter) {
    let data = filter;
    if (!Array.isArray(filter)) data = Object.keys(filter);

    for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(filter))
            if (data[i].active)
                return true;
            else
                for (let j = 0; j < data[i].length; j++)
                    if (data[i][j].active)
                        return true;
    }

    return false;
}