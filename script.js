const countriesElem = document.querySelector('.countries');
const search = document.querySelector('.search-glass');
const selectRegion = document.getElementById('select-region');
const searchInput = document.querySelector('#search-input');
const searchDelete = document.querySelector('#search-delete');
const searchBar = document.querySelector('.search-bar');
const btnMode = document.querySelector('.btn-mode');

let currentPage = 1;
const itemsPerPage = 20;

function paginateCountries(countries, page = 1) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return countries.slice(startIndex, endIndex);
}

function renderPaginationControls(totalItems) {
  const paginationContainer = document.createElement('nav');
  paginationContainer.classList.add(
    'pagination',
    'is-centered',
    'is-small',
    'mt-4'
  );
  paginationContainer.setAttribute('role', 'navigation');
  paginationContainer.setAttribute('aria-label', 'pagination');

  const paginationList = document.createElement('ul');
  paginationList.classList.add('pagination-list');

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxVisiblePages = 5;

  function createPageButton(page) {
    const pageItem = document.createElement('li');
    const pageButton = document.createElement('a');
    pageButton.classList.add('pagination-link');
    pageButton.setAttribute('aria-label', `Goto page ${page}`);
    pageButton.textContent = page;

    if (page === currentPage) {
      pageButton.classList.add('is-current');
      pageButton.setAttribute('aria-current', 'page');
    }

    pageButton.addEventListener('click', () => {
      currentPage = page;
      updateCountriesDisplay();
      renderPaginationControls(totalItems);
    });

    pageItem.appendChild(pageButton);
    return pageItem;
  }

  function addEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.classList.add('pagination-ellipsis');
    ellipsis.innerHTML = '&hellip;';
    paginationList.appendChild(ellipsis);
  }

  const pages = [];
  pages.push(1);

  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 2; i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start <= 1) {
      start = 2;
      end = start + maxVisiblePages - 1;
    }

    if (end >= totalPages) {
      end = totalPages - 1;
      start = end - maxVisiblePages + 1;
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  pages.forEach((p) => {
    if (p === '...') {
      addEllipsis();
    } else {
      paginationList.appendChild(createPageButton(p));
    }
  });

  paginationContainer.appendChild(paginationList);

  const existingPagination = document.querySelector('.pagination');
  if (existingPagination) {
    existingPagination.remove();
  }

  const mainElement = document.querySelector('main');
  mainElement.appendChild(paginationContainer);
}

function updateCountriesDisplay() {
  countriesElem.innerHTML = '';
  const paginatedCountries = paginateCountries(allCountries, currentPage);
  paginatedCountries.forEach(showCountry);
  setUniformCardHeight();
}

let allCountries = [];

async function getCountry() {
  const url = await fetch('https://restcountries.com/v3.1/all');
  const res = await url.json();

  allCountries = res.sort((a, b) =>
    a.translations.por.common.localeCompare(b.translations.por.common)
  );
  renderPaginationControls(allCountries.length);
  updateCountriesDisplay();
}

getCountry();

function showCountry(data) {
  const { flags, population, region, languages, capital, translations } = data;

  const languageList = languages ? Object.values(languages).join(', ') : 'N/A';
  const capitalList = capital ? Object.values(capital).join(', ') : 'N/A';

  const country = document.createElement('div');
  country.classList.add('country');
  country.innerHTML = `
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <img src="${flags.png}" alt="${flags.alt}">
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <h3 class="title is-4">${translations.por.common}</h3>
          <p class="subtitle is-6 region-name"><strong>Região:</strong> ${region}</p>
        </div>
      </div>
      <div class="content">
        <p><strong>Capital:</strong> ${capitalList}</p>
        <p><strong>Linguagens:</strong> ${languageList}</p>
        <p><strong>População:</strong> ${population.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  </div>`;
  countriesElem.appendChild(country);
}

function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

async function fetchAllCountries() {
  const url = await fetch('https://restcountries.com/v3.1/all');
  return await url.json();
}

function filterAndDisplayCountries(filterCallback) {
  countriesElem.innerHTML = '';
  currentPage = 1;

  const filteredCountries = allCountries.filter(filterCallback);
  renderPaginationControls(filteredCountries.length);

  const paginatedCountries = paginateCountries(filteredCountries, currentPage);
  paginatedCountries.forEach(showCountry);
  setUniformCardHeight();

  return filteredCountries;
}

function displayNoResultsMessage() {
  countriesElem.innerHTML =
    '<p class="no-results">Nenhum resultado encontrado.</p>';
  const existingPagination = document.querySelector('.pagination');
  if (existingPagination) {
    existingPagination.remove();
  }
}

selectRegion.addEventListener('change', async function () {
  const region = selectRegion.value;

  if (region === 'All') {
    renderPaginationControls(allCountries.length);
    updateCountriesDisplay();
    return;
  }

  searchInput.value = '';

  const filteredCountries = filterAndDisplayCountries(
    (country) => country.region === region
  );
  if (filteredCountries.length === 0) {
    displayNoResultsMessage();
  }
});

searchInput.addEventListener('input', async (event) => {
  const searchTerm = normalizeText(event.target.value);

  if (searchTerm === '') {
    renderPaginationControls(allCountries.length);
    updateCountriesDisplay();
    return;
  }

  const filteredCountries = filterAndDisplayCountries((country) => {
    selectRegion.value = 'All';
    const name = normalizeText(country.translations.por.common);
    return name.includes(searchTerm);
  });

  if (filteredCountries.length === 0) {
    displayNoResultsMessage();
  }
});

searchDelete.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
});

function saveModeToLocalStorage(isWhiteMode) {
  localStorage.setItem('themeMode', isWhiteMode ? 'white' : 'black');
}

function loadModeFromLocalStorage() {
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode === 'white') {
    document.body.classList.add('white');
    document.querySelector('.footer').classList.add('white');
    document.querySelector('#search-input').classList.add('white');
    document.querySelector('#select-region').classList.add('white');
    document.querySelector('.nav').classList.add('white');
    document.querySelector('.dark-mode').classList.add('white');

    const moonIcon = document.querySelector('.bx.bxs-moon');
    moonIcon.style.color = 'black';

    btnMode.textContent = 'Dark Mode';
    btnMode.style.color = 'black';
  }
}

btnMode.addEventListener('click', () => {
  const isWhiteMode = document.body.classList.toggle('white');
  document.querySelector('.footer').classList.toggle('white');
  document.querySelector('#search-input').classList.toggle('white');
  document.querySelector('#select-region').classList.toggle('white');
  document.querySelector('.nav').classList.toggle('white');
  document.querySelector('.dark-mode').classList.toggle('white');

  const moonIcon = document.querySelector('.bx.bxs-moon');
  moonIcon.style.color = isWhiteMode ? 'black' : 'white';

  btnMode.textContent = isWhiteMode ? 'Dark Mode' : 'Light Mode';
  btnMode.style.color = isWhiteMode ? 'black' : 'white';

  saveModeToLocalStorage(isWhiteMode);
});

loadModeFromLocalStorage();

function setUniformCardHeight() {
  const cards = document.querySelectorAll('.country');
  let maxHeight = 0;

  cards.forEach((card) => {
    card.style.height = 'auto';
    const cardHeight = card.offsetHeight;
    if (cardHeight > maxHeight) {
      maxHeight = cardHeight;
    }
  });

  cards.forEach((card) => {
    card.style.height = `${maxHeight}px`;
  });
}
