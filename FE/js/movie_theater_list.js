document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let inputGroup = e.target.closest('.input-group');
            let input = inputGroup.querySelector('input.form-control');
            let button = inputGroup.querySelector('.dropdown-toggle');

            input.value = e.target.textContent.trim();

            let dropdown = bootstrap.Dropdown.getInstance(button) || new bootstrap.Dropdown(button);
            dropdown.hide();
            button.blur();
        });
    });

    let modal = document.getElementById('myModal');
    let btn = document.querySelector('.btn.btn-custom');

    modal.addEventListener('show.bs.modal', function () {
        btn.classList.add('modal-open-btn');
    });

    modal.addEventListener('hidden.bs.modal', function () {
        btn.classList.remove('modal-open-btn');
    });

});