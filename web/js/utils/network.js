async function postJSON(url, json) {
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json)
    });
    let j = await res.json();
    return j;
}

async function getJSON(url) {
    let accessToken = localStorage.getItem("accessToken")
    let res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    });
    let j = await res.json();
    return j;
}


// export {
//     postJSON
// }