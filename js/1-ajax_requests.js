function authorize(data, url) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'POST',
            url: url,
            data: data,
        })
            .then(function (response) {
                if (response.data.status === 'Success') {
                    resolve(response.data)
                }
            })
            .catch(function (error) {
                reject(error)
            });
    })
}

function postRequest(data, url) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'POST',
            url: url,
            // headers: {
            //     Authorization: "Bearer " + token
            // },
            data: data,
        })
            .then(function (response) {
                if (response.status === 200) {
                    resolve(response.data)
                }
            })
            .catch(function (error) {
                reject(error)
            });
    })
}

function getRequest(url) {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                reject(error)
            });
    });
}

function putRequest(visit, id) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'PUT',
            url: `http://cards.danit.com.ua/cards/${id}`,
            data: visit,
        })
            .then(function (response) {
                if (response.status === 200) {
                    resolve(response.data)
                }
            })
            .catch(function (error) {
                reject(error)
            });
    })
}

function deleteRequest(id) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'DELETE',
            url: `http://cards.danit.com.ua/cards/${id}`,
        }).then(function (response) {
            resolve(response)
        }).catch(function (error) {
            reject(error)
        })
    })
}
