class Visit {
    constructor(visit) {
        this.doctor = visit.doctor;
        this.title = visit.title;
        this.description = visit.description;
        this.status = visit.status;
        this.priority = visit.priority;
        this.id = visit.id;
        this.content = {};
        this.content.patientFullName = visit.content.patientFullName;
        this.content.doctorFullName = visit.content.doctorFullName;
        this.content.visitDate = visit.content.visitDate;
        this._visitCard = null;
    }

    static renderAllCards(cards) {
        document.querySelectorAll('.visit').forEach(e => {
            e.remove();
        });
        cards.forEach(card => {
                Visit.chooseVisit(card)
            }
        )
    }

    static chooseVisit(visit) {
        const container = document.querySelector('.visit-wrapper');
        switch (visit.doctor) {
            case "therapist" :
                const visitTherapist = new VisitTherapist(visit);
                visitTherapist.render(container);
                break;
            case "cardiologist" :
                const visitCardio = new VisitCardio(visit);
                visitCardio.render(container);
                break;
            case "dentist" :
                const visitDentist = new VisitDentist(visit);
                visitDentist.render(container);
                break;
        }
    }

    render(container) {
        /*** Remove message "No items added... ***/
        const noVisitsMsg = container.querySelector('.visit-wrapper-title');
        noVisitsMsg ? noVisitsMsg.classList.add('hidden') : "";

        const visitCard = document.createElement('div');
        visitCard.classList.add('visit');
        visitCard.id = this.id;
        this._visitCard = visitCard;
        visitCard.setAttribute('draggable', 'true');
        visitCard.innerHTML = `
            <i class="fas fa-portrait visit-photo"></i> 
            <p class="visit-person_name visit-line collapsed"><span>Patient name: </span>${this.content.patientFullName}</p>
            <p class="visit-doctor_type visit-line collapsed"><span>Doctor: </span>${this.doctor}</p>
            <p class="visit-doctor_name visit-line collapsed"><span>Doctor name: </span>${this.content.doctorFullName}</p>
            <p class="visit-purpose visit-line collapsed"><span>Visit purpose: </span>${this.title}</p>
            <p class="visit-desc_short visit-line collapsed"><span>Short description: </span>${this.description}</p>
            <p class="visit-urgency visit-line collapsed"><span>Urgency: </span>${this.priority}</p>
            <p class="visit-date visit-line collapsed"><span>Date of visit: </span>${this.content.visitDate.split('-').reverse().join('-')}</p>
            <button class="visit-show_more_btn">Show Details</button>
            <div class="visit-options">
                <button class="visit-options-edit_btn options-btn">Edit</button>
                <button class="visit-options-finish_btn options-btn">Finish</button>
            </div>
            <i class="fas fa-edit visit-options_btn"></i>
            <i class="fas fa-trash-alt visit-delete_btn"></"></i>
        `;

        container.append(visitCard);

        const showMoreBtn = visitCard.querySelector('.visit-show_more_btn');
        showMoreBtn.addEventListener('click', () => this.showMore());

        const VisitDeletionBtn = visitCard.querySelector('.visit-delete_btn');
        VisitDeletionBtn.addEventListener('click', () => this.deleteVisit());

        const visitOptionsBtn = visitCard.querySelector('.visit-options_btn');
        visitOptionsBtn.addEventListener('click', () => this.showOptions(visitOptionsBtn));

        const visitEditBtn = visitCard.querySelector('.visit-options-edit_btn');
        visitEditBtn.addEventListener('click', () => this.updateVisit(this));
        this.status ==='finished' ? visitEditBtn.disabled = true : "";

        const visitFinishBtn = visitCard.querySelector('.visit-options-finish_btn');
        visitFinishBtn.addEventListener('click', () => this.finishVisit(visitFinishBtn));

        if (this.status === 'finished') {
            this._visitCard.classList.add('visit-finished');
            visitFinishBtn.textContent = 'Open';
        }

        visitCard.draggable = true;
        visitCard.addEventListener('dragstart', this.drag)
    }

    showMoreGeneral() {
        this._visitCard.querySelector('.visit-desc_short').classList.remove('collapsed');
        this._visitCard.querySelector('.visit-doctor_name').classList.remove('collapsed');
        this._visitCard.style.height = 'auto';

        const showMoreBtn = this._visitCard.querySelector('.visit-show_more_btn');
        showMoreBtn.classList.add('hidden');

        const showLessBtn = document.createElement('button');
        showLessBtn.classList.add('visit-show_less_btn');
        showLessBtn.textContent = 'Hide Details';
        showLessBtn.addEventListener('click', () => this.showLess(showMoreBtn, showLessBtn));
        this._visitCard.append(showLessBtn);
    }

    showLess(showMoreBtn, showLessBtn) {
        showLessBtn.remove();
        this._visitCard.querySelector('.visit-more_info').remove();
        showMoreBtn.classList.remove('hidden');
        this._visitCard.querySelector('.visit-desc_short').classList.add('collapsed');
        this._visitCard.querySelector('.visit-doctor_name').classList.add('collapsed');
    }

    showOptions(visitOptionsBtn) {
        visitOptionsBtn.classList.toggle('visit-options_btn_active');
        const optionBtnArr = this._visitCard.querySelectorAll('.options-btn');
        optionBtnArr.forEach(el => el.classList.toggle('btn_active'));
    }

    deleteVisit() {
        let modal = new Modal('delete-visit', 'You want to delete this visit?');
        modal.render(document.body);
        const modalWrapper = document.querySelector('.modal');
        const modalTitle = document.querySelector('.modal-header-title');
        modalTitle.classList.add('delete-visit-title');
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `<div class="delete-visit-wrapper"><a href="#" class="delete-visit-btn">Yes</a><a href="#" class="delete-visit-btn">No</a></div>`;
        modalContent.addEventListener('click', (e) => {
            if (e.target === document.getElementsByClassName('delete-visit-btn')[0]) {
                deleteRequest(this.id).then(() => {
                    this._visitCard.remove();
                    visitsArray = visitsArray.filter(el => {
                        return el.id !== this.id
                    });
                });
                modalWrapper.remove();
                modalTitle.classList.remove('delete-visit-title');
            } else if (e.target === document.getElementsByClassName('delete-visit-btn')[1]) {
                modalTitle.classList.remove('delete-visit-title');
                modalWrapper.remove();
            }
        });
    }

    finishVisit(visitFinishBtn) {
        this._visitCard.classList.add('in-progress');
        const visitOptionsBtn = this._visitCard.querySelector('.visit-options_btn');
        this.showOptions(visitOptionsBtn);
        setTimeout(() => {

            if (visitFinishBtn.textContent === 'Finish') {
                this.status = 'finished';
                putRequest(this, this.id)
                    .then((response) => {
                        this._visitCard.classList.remove('in-progress');
                        this._visitCard.classList.add('visit-finished');
                        visitsArray = visitsArray.map(card => {
                            return card.id === response.id ? response : card;
                        });
                        visitFinishBtn.textContent = 'Open';
                        const editBtn = this._visitCard.querySelector('.visit-options-edit_btn');
                        editBtn.disabled = true;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.status = 'opened';
                    });
            } else {
                this.status = 'opened';
                putRequest(this, this.id)
                    .then((response) => {
                        this._visitCard.classList.remove('in-progress');
                        this._visitCard.classList.remove('visit-finished');
                        visitsArray = visitsArray.map(card => {
                            return card.id === response.id ? response : card;
                        });
                        visitFinishBtn.textContent = 'Finish';
                        const editBtn = this._visitCard.querySelector('.visit-options-edit_btn');
                        editBtn.disabled = false;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.status = 'finished';
                    });
            }
        }, 500);
    }

    updateVisit(card) {
        const editVisit = new Modal('edit-modal', 'Edit your visit:');
        editVisit.render(document.body);
        const modalWrapperForRender = document.querySelector('.modal-content');
        if (card.doctor === 'dentist') {
            new DentistForm(card).render(modalWrapperForRender);
        } else if (card.doctor === 'therapist') {
            new TherapistForm(card).render(modalWrapperForRender);
        } else if (card.doctor === 'cardiologist') {
            new CardiologistForm(card).render(modalWrapperForRender);
        }
    }

    drag(e) {
        e.dataTransfer.setData('text', e.currentTarget.id);
    };
}

class VisitCardio extends Visit {
    constructor(visit) {
        super(visit);
        this.content.bloodPressure = visit.content.bloodPressure;
        this.content.weightIndex = visit.content.weightIndex;
        this.content.prevDiseases = visit.content.prevDiseases;
        this.content.age = visit.content.age;
    }

    showMore() {
        super.showMoreGeneral();
        const moreInfo = document.createElement('div');
        moreInfo.classList.add('visit-more_info');
        moreInfo.innerHTML = `
            <p class="visit-blood_pressure visit-line"><span>Blood pressure: </span>${this.content.bloodPressure}</p>
            <p class="visit-weight_index visit-line"><span>Weight index: </span>${this.content.weightIndex}</p>
            <p class="visit-prev_diseases visit-line"><span>Previous diseases: </span>${this.content.prevDiseases}</p>
            <p class="visit-age visit-line"><span>Age: </span>${this.content.age}</p>
        `;

        this._visitCard.querySelector('.visit-show_less_btn').before(moreInfo);
    }
}

class VisitDentist extends Visit {
    constructor(visit) {
        super(visit);
        this.content.lastVisit = visit.content.lastVisit;
    }

    showMore() {
        super.showMoreGeneral();
        const moreInfo = document.createElement('div');
        moreInfo.classList.add('visit-more_info');
        moreInfo.innerHTML = `
            <p class="visit-last_visit visit-line"><span class="visit-line">Last visit: </span>${this.content.lastVisit.split('-').reverse().join('-')}</p>
        `;

        this._visitCard.querySelector('.visit-show_less_btn').before(moreInfo);
    }
}

class VisitTherapist extends Visit {
    constructor(visit) {
        super(visit);
        this.content.age = visit.content.age;
    }

    showMore() {
        super.showMoreGeneral();
        const moreInfo = document.createElement('div');
        moreInfo.classList.add('visit-more_info');
        moreInfo.innerHTML = `
            <p class="visit-age visit-line"><span class="visit-line">Age: </span>${this.content.age}</p>
        `;

        this._visitCard.querySelector('.visit-show_less_btn').before(moreInfo);
    }
}
