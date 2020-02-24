const container = document.querySelector('.visit-wrapper');
container.addEventListener('dragover', allowDrop);
container.addEventListener('drop', drop);

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    const draggableEl = document.getElementById(data);

    let visits = document.querySelectorAll('.visit');
    /*** Overwrite new coords for all cards ***/
    visits.forEach(el => {
        el.dataset.right = el.getBoundingClientRect().right;
        el.dataset.left = el.getBoundingClientRect().left;
        el.dataset.bottom = el.getBoundingClientRect().bottom;
    });

    let rowFactor = 0;
    for (let i = 0; i < visits.length; i++) {
        i !== 0 && i % 3 === 0 ? rowFactor += 3 : "";
        /*** Check whether this row is full ***/
        if (visits[2 + rowFactor]) {
            /*** Check whether element is on the very RIGHT (after last element in the row) ***/
            if (e.clientX > +visits[2 + rowFactor].dataset.right) {
                /*** Check whether this is correct row and drop draggable element as last element of the row***/
                if (e.clientY <= +visits[i].dataset.bottom) {
                    visits[2 + i].after(draggableEl);
                    rowFactor = 0;
                    break;
                }
            }
        }

        /*** Check left/bottom coords and drop draggable element BEFORE selected element***/
        if (e.clientY <= +visits[i].dataset.bottom && e.clientX <= +visits[i].dataset.left) {
            visits[i].before(draggableEl);
            break;

            /*** Check right/bottom coords and drop draggable element AFTER selected element***/
        } else if (e.clientY <= +visits[i].dataset.bottom && e.clientX <= +visits[i].dataset.right) {
            visits[i].after(draggableEl);
            break;
        }

        /*** Insert as last element in container***/
        if (i === visits.length - 1) {
            visits[visits.length - 1].after(draggableEl);
        }
    }
}