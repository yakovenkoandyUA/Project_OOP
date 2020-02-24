class Form {
    constructor(visit) {
        this._patientFullName = visit.content.patientFullName || '';
        this._title = visit.title || '';
        this._description = visit.description || '';
        this._visitDate = visit.content.visitDate || '';
        this._id = visit.id || '';
        this._doctor = visit.doctor || '';
        this._priority = visit.priority || '--Choose priority--';
    }

    get gatherFormInputs() {
        const formInfo = document.querySelectorAll(".input-info");
        const newObj = {};
        formInfo.forEach(el => {
            newObj[el.name] = el.value || '';
        });
        return newObj;
    }

    static chooseDoctor(container) {
        container.innerHTML = `<select name="doctor" id="choose-doctor" class="input-info">
                        <option value="etc">--Choose your doctor--</option>
                        <option value="therapist">Therapist</option>
                        <option value="cardiologist">Cardiologist</option>
                        <option value="dentist">Dentist</option>
                    </select>`;

        const chooseDoctor = document.getElementById('choose-doctor');
        const placeToRender = document.querySelector('.modal-content');
        chooseDoctor.addEventListener('change', ev => {
            const inputFormWrapper = document.getElementsByClassName('input-forms-wrapper');

            // ВЛАД: ЗАЧЕМ ЭТА ПРОВЕРКА?
            if (inputFormWrapper.length === 1) {
                inputFormWrapper[0].remove();
            }

            /*** Creation of blank visit Object ***/
            const visitInfo = {};
            visitInfo.content = {};

            if (ev.target.value === 'therapist') {
                const therapistForm = new TherapistForm(visitInfo);
                therapistForm.render(placeToRender);
            } else if (ev.target.value === 'cardiologist') {
                const cardiologistForm = new CardiologistForm(visitInfo);
                cardiologistForm.render(placeToRender);
            } else if (ev.target.value === 'dentist') {
                const dentistForm = new DentistForm(visitInfo);
                dentistForm.render(placeToRender);
            }
        })
    }

    static gatherInfoForBackEnd(mainFields, gatheredInputs, doctor) {
        const visitAdditionalInfo = {patientFullName: gatheredInputs.patientFullName};
        let count = 0;
        for (let key in gatheredInputs) {
            count += 1;
            if (count <= mainFields) {
                continue;
            }
            visitAdditionalInfo[key] = gatheredInputs[key];
        }
        const visitFullInfo = {
            doctor: doctor || gatheredInputs.doctor,
            title: gatheredInputs.title,
            description: gatheredInputs.description,
            status: 'opened',
            priority: gatheredInputs.priority,
            content: visitAdditionalInfo,
        };
        return visitFullInfo;
    }

    render(container) {
        const formWrapper = document.createElement('div');
        formWrapper.classList.add('input-forms-wrapper');
        const therapistForm = document.createElement('form');
        therapistForm.id = 'form-submit';
        container.appendChild(formWrapper);
        formWrapper.appendChild(therapistForm);
        therapistForm.innerHTML = `<label>Enter your Full name :</label>
<input type="text" required class="input-info" name="patientFullName" placeholder="Full name" value="${this._patientFullName}"/>
<label>Enter your purpose of visit : </label>
<input type="text" required class="input-info" name="title" placeholder="Your purpose" value="${this._title}">
<label>Your short description of visit :</label>
<textarea cols="70" rows="10" class="input-info" name="description" placeholder="Description" id="description" >${this._description}</textarea>
<label>Choose priority : </label>
<select id="choose-priority" class="input-info" name="priority" required>
<option>--Choose priority--</option>
<option>Low</option>
<option >Medium</option>
<option>High</option>
</select>
<label>Choose date of your visit :</label>
<input type="date" required class="input-info" id="visit-date" name="visitDate" value="${this._visitDate}">
<input id="submit-visit" value="Submit visit" type="submit">`;

        const priority = document.getElementById('choose-priority');
        this._priority !== '--Choose priority--' ? priority.value = this._priority : "";

        const submitForm = document.getElementById('form-submit');
        submitForm.addEventListener('submit', (e) => {
            e.preventDefault();

            /*** Check for correctness of dates and age ***/
            document.querySelector('.error-msg') ? document.querySelector('.error-msg').remove() : "";

            const visitDate = document.getElementById('visit-date');
            if(new Date(visitDate.value) < Date.now()) {
                const errorMsg = document.createElement('span');
                errorMsg.classList.add('error-msg');
                errorMsg.textContent = "Date of visit can't be in the past!";
                visitDate.after(errorMsg);
                return
            }

            const lastVisit = document.getElementById('last-visit');
            if (lastVisit) {
                if(new Date(lastVisit.value) > Date.now()) {
                    const errorMsg = document.createElement('span');
                    errorMsg.classList.add('error-msg');
                    errorMsg.textContent = "Date of last visit can't be in future!";
                    visitDate.after(errorMsg);
                    return
                }
            }

            const patientAge = document.getElementById('patient-age');
            if (patientAge) {
                if(patientAge.value <= 0) {
                    const errorMsg = document.createElement('span');
                    errorMsg.classList.add('error-msg');
                    errorMsg.textContent = "Please feel 'Age' field correctly";
                    visitDate.after(errorMsg);
                    return
                }
            }

            /*** If field "Prioirty" is not chosen - it gets LOW ***/
            priority.selectedIndex === 0 ? priority.selectedIndex = 1 : "";

            /*** If field "Doctor Name" is not chosen - it gets Available doctor ***/
            const doctorFullName = document.getElementById('doctor-list');
            doctorFullName.selectedIndex === 0 ? doctorFullName.selectedIndex = 1 : "";

            const modal = document.querySelector('.modal');
            if (modal.id === 'modal-visit') {
                let gatheredVisitInputs = this.gatherFormInputs;
                const visitFullInfo = Form.gatherInfoForBackEnd(5, gatheredVisitInputs);

                postRequest(visitFullInfo, 'http://cards.danit.com.ua/cards')
                    .then(response => {
                        visitsArray.push(response);
                        Visit.chooseVisit(response);
                    })
                    .catch(error => console.log(error));

            } else if (modal.id === 'edit-modal') {
                const gatheredFormInputs = this.gatherFormInputs;
                const visitFullInfo = Form.gatherInfoForBackEnd(4, gatheredFormInputs, this._doctor);

                putRequest(visitFullInfo, `${this._id}`)
                    .then(response => {
                        const isExist = visitsArray.some(card => card.id === response.id);
                        if (!isExist) {
                            visitsArray.push(response);
                        } else {
                            visitsArray = visitsArray.map(card => {
                                return card.id === response.id ? response : card;
                            });
                        }
                        Visit.renderAllCards(visitsArray);
                    })
                    .catch(error => console.log(error));
            }
            modal.remove();
        })
    }
}

class TherapistForm extends Form {

    constructor(visit) {
        super(visit);
        this._age = visit.content.age || '';
        this._doctorFullName = visit.content.doctorFullName || '--Choose your Therapist--';
    }

    render(container) {
        super.render(container);

        const additionalVisitInfo = document.querySelector('#choose-priority');
        additionalVisitInfo.insertAdjacentHTML('afterend', `
            <label>Enter your age :</label>
            <input type="number" required class="input-info" id="patient-age" value='${this._age}' placeholder="Age" name="age">
            <label>Choose your Therapist : </label>
            <select id="doctor-list" class="input-info" name="doctorFullName">
                <option>--Choose your Therapist--</option>
                <option>Available Therapist</option>
                <option>Spivak Nina</option>
                <option>Velichko Artem</option>
                <option>Koval Nikita</option>
            </select>
        `);

        const doctorFullName = document.getElementById('doctor-list');
        doctorFullName.value = this._doctorFullName;
    }
}

class CardiologistForm extends Form {
    constructor(visit) {
        super(visit);
        this._weightIndex = visit.content.weightIndex || '';
        this._bloodPressure = visit.content.bloodPressure || '';
        this._prevDiseases = visit.content.prevDiseases || '';
        this._age = visit.content.age || '';
        this._doctorFullName = visit.content.doctorFullName || '--Choose your Cardiologist--';

    }

    render(container) {
        super.render(container);
        const additionalVisitInfo = document.querySelector('#choose-priority');
        additionalVisitInfo.insertAdjacentHTML('afterend',`
            <label>Enter your BMI :</label>
            <input type="number" required class="input-info" value="${this._weightIndex}" name="weightIndex" placeholder="Your bmi">
            <label>Enter your blood preasure : </label>
            <input type="text" required class="input-info" name="bloodPressure" value="${this._bloodPressure}" placeholder="Blood pressure">
            <label>Enter your previous heart diseases : </label>
            <textarea  cols="70" rows="5" class="input-info" required name="prevDiseases" placeholder="Your diseases">${this._prevDiseases}</textarea>
            <label>Enter your age :</label>
            <input type="number" required class="input-info" id="patient-age" value="${this._age}" placeholder="Age" name="age">
            <label>Choose your Cardiologist : </label>
            <select id="doctor-list" class="input-info" name="doctorFullName" required>
                <option>--Choose your Cardiologist--</option>
                <option>Available Cardiologist</option>
                <option>Ostapenko Artem</option>
                <option >Yariy Ivan</option>
                <option>Bulgakov Aleksandr</option>
            </select>
        `);

        const doctorFullName = document.getElementById('doctor-list');
        doctorFullName.value = this._doctorFullName;
    }
}

class DentistForm extends Form {
    constructor(visit) {
        super(visit);
        this._lastVisit = visit.content.lastVisit || '';
        this._doctorFullName = visit.content.doctorFullName || '--Choose your Dentist--';
    }

    render(container) {
        super.render(container);
        const additionalVisitInfo = document.querySelector('#choose-priority');
        additionalVisitInfo.insertAdjacentHTML('afterend', `
            <label>Enter your last date of visit to dentist :</label>
            <input type="date" required value='${this._lastVisit}' class="input-info" id="last-visit" name="lastVisit">
            <label>Choose your Dentist : </label>
            <select id="doctor-list" class="input-info" name="doctorFullName" required>
                <option>--Choose your Dentist--</option>
                <option>Available Dentist</option>
                <option>Spivak Sergey</option>
                <option>Novik Marina</option>
                <option>Petrov Denis</option>
            </select>
        `);

        const doctorFullName = document.getElementById('doctor-list');
        doctorFullName.value = this._doctorFullName;
    }
}
