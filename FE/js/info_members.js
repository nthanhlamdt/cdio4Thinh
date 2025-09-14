document.addEventListener('DOMContentLoaded', () => {
    let infoAside = document.querySelector('.info-aside');

    let tabLinks = {
        user: document.querySelector('.link-user-info'),
        history: document.querySelector('.link-user-history'),
        password: document.querySelector('.link-user-password')
    };

    function activateTab(tab) {
        infoAside.classList.remove('show-user', 'show-history', 'show-password');
        infoAside.classList.add(`show-${tab}`);

        Object.keys(tabLinks).forEach(key => {
            tabLinks[key].classList.toggle('active', key === tab);
        });
    }

    tabLinks.user.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('user');
    });

    tabLinks.history.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('history');
    });

    tabLinks.password.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('password');
    });

    activateTab('user');
});