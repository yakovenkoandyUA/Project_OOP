const searchFrom = document.getElementById('search-form');
searchFrom.addEventListener('click', (e) => e.preventDefault());

const searchBtn = document.getElementById('search');
searchBtn.addEventListener('click', function () {
    getRequest('http://cards.danit.com.ua/cards').then(response => {
        document.getElementsByClassName('visit-wrapper')[0].innerHTML = '';
        const statusVisit = document.getElementById('status-visit').value;
        const statusPriority = document.getElementById('status-priority').value;
        const inputSearch = document.getElementById('search-cards').value;
        const visitsArray = response.filter(item => {
            let {priority, status, title, description, content} = item;
            return (statusPriority === priority || statusPriority === 'All')
                && (statusVisit.toLowerCase() === status || statusVisit === 'All')
                && (title.toLowerCase().includes(inputSearch) || !inputSearch || description.toLowerCase().includes(inputSearch) ||
                    content.patientFullName.toLowerCase().includes(inputSearch))
        });
        Visit.renderAllCards(visitsArray);
    }).catch(error => {
        console.log(error.text);
    })
});
