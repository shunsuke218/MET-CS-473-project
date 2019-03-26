async function postJSON(url, json) {
    let accessToken = localStorage.getItem("accessToken")
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${accessToken}`,
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
    // console.log(accessToken);
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