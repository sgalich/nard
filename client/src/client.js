const sock = io();

const writeEvent = (text) => {
    const parent = document.getElementById('events');
    const el = document.createElement('p');
    el.innerHTML = text;
    parent.appendChild(el);
};

writeEvent('Welcome!')