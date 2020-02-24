localStorage.clear();
let visitsArray = [];

class Modal {
    constructor(id, title) {
        this._modal = null;
        this._id = id;
        this._title = title;
    }

    render(container) {
        this._modal = document.createElement('div');
        this._modal.classList.add('modal');
        this._modal.classList.add('bg-active');
        this._modal.id = this._id;
        this._modal.innerHTML = `
                <div class="modal-wrapper">
                    <div class="modal-header">
                        <h1 class="modal-header-title">${this._title}</h1>
                        <span class="close">x</span>
                    </div>
                    <div class="modal-content">
                     
                    </div>
                </div>
            `;
        container.appendChild(this._modal);
        let modal = document.getElementById(`${this._id}`);
        document.querySelector('.close').addEventListener('click', function () {
            modal.remove()
        });
        window.onmousedown = function (e) {
            if (e.target == modal) {
                modal.remove()
            }
        };
        window.onkeyup = function (e) {
            if (e.key == "Escape") {
                modal.remove()
            }
        };
        modalVisit.disabled = false;
        modalLoginBtn.disabled = false;
    }
}

const modalLoginBtn = document.getElementById('loginBtn');
modalLoginBtn.addEventListener('click', () => {
    modalLoginBtn.disabled = true;
    let modal = new Modal('modal-login', 'Sign in:',);
    modal.render(document.body);
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `<form action="http://cards.danit.com.ua/login" id="form-login">
                       <input type="text" placeholder="Login" value="vlad.mezhik@gmail.com" class="login-modal" id="login" required>
                       <input type="password" placeholder="Password" class="login-password" id="password" value="Step_1019" required>
                       <button id="login-btn-submit" class="login-button">Submit</button>
                       </form>`;
    const form = document.getElementById('form-login');
    form.addEventListener('submit', (function (e) {
        e.preventDefault();
        const email = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const data = {
            email: email,
            password: password
        };
        authorize(data, 'http://cards.danit.com.ua/login').then(response => {
            localStorage.setItem('accessToken', response.token);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
            const iconLogin = document.querySelector('.icon-login');
            iconLogin.classList.remove('hidden');
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.style.display = 'none';
            const createVisit = document.getElementById('create-form-btn');
            createVisit.style.display = 'inline-block';
            const modalLogin = document.getElementById('modal-login');
            modalLogin.remove();
            getRequest('http://cards.danit.com.ua/cards').then(responseWithCards => {
                visitsArray = responseWithCards;
                Visit.renderAllCards(visitsArray);
            });
        }).catch(error => {
            // На БЭКЕНДЕ нету условия при ошибке неправильного ввода логина или пароля,
            // если не правильно вводить данные не приходит даже response
            const errorMessage = document.createElement('p');
            errorMessage.textContent = error.text;
            form.after(errorMessage)
        });
    }));
});

const modalVisit = document.getElementById('create-form-btn');
modalVisit.addEventListener('click', () => {
    modalVisit.disabled = true;
    let modal = new Modal('modal-visit', 'Visit Info:');
    modal.render(document.body);
    const container = document.querySelector('.modal-content');
    Form.chooseDoctor(container);
});

