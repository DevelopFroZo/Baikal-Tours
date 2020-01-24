export {
    response
}

// #fix add automaticly redirect and functions
async function response(method, url, obj){
    return await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })
}