const countriesElem = document.querySelector(".countries")
const search = document.querySelector(".search-glass")
const selectRegion = document.getElementById("select-region");
const searchInput = document.querySelector("#search-input");
const searchDelete = document.querySelector("#search-delete");
const searchBar = document.querySelector(".search-bar")
const btnMode = document.querySelector(".btn-mode")

async function getCountry() {
  const url = await fetch("https://restcountries.com/v3.1/all");
  const res = await url.json();
  const sortedCountries = res.sort((a, b) => a.translations.por.common.localeCompare(b.translations.por.common));
  sortedCountries.forEach(element => {
    showCountry(element);
  });
}
getCountry()

function showCountry(data) {
  const { flags, population, region, languages, capital, translations } = data

  const languageList = languages ? Object.values(languages).join(", ") : "N/A";
  const capitalList = capital ? Object.values(capital).join(", ") : "N/A";

  const country = document.createElement("div");
  country.classList.add("country");
  country.innerHTML = `
        <div class="country">
          <img src="${flags.png}" alt="${flags.alt}">
          <div class="country-info">
            <h3>${translations.por.common}</h3><br>
            <p><strong>Capital: </strong>${capitalList}</p>
            <p class="region-name"><strong>Região: </strong>${region}</p>
            <p><strong>Linguagens: </strong>${languageList}</p>
            <p><strong>População: </strong>${population.toLocaleString("pt-BR")}</p>
          </div>
        </div>`;
  countriesElem.appendChild(country)
}

selectRegion.addEventListener('change', function () {
  const region = selectRegion.value;

  const countries = document.querySelectorAll('.country');
  countries.forEach(country => {
    const regionName = country.querySelector('.region-name');

    if (region === 'All' || regionName.innerText.includes(region)) {
      country.style.display = 'block';
    } else {
      country.style.display = 'none';
    }
  });
});

searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const countries = document.querySelectorAll(".country");

  countries.forEach((country) => {
    const name = country.querySelector("h3").textContent.toLowerCase();

    if (name.startsWith(searchTerm)) {
      country.style.display = "block";
    } else {
      country.style.display = "none";
    }
  });
});

searchDelete.addEventListener('click', () => {
  searchInput.value = "";
  searchInput.dispatchEvent(new Event('input'));
});

btnMode.addEventListener('click', () => {
  const nav = document.querySelector(".nav")
  const footer = document.querySelector(".footer")

  const country = countriesElem.querySelectorAll(".country")
  country.forEach((country) => {
    country.classList.toggle('white');
  });

  const countryInfo = countriesElem.querySelectorAll(".country-info")
  countryInfo.forEach((countryInfo) => {
    countryInfo.classList.toggle('white');
  });

  document.body.classList.toggle('white')
  nav.classList.toggle('white')
  footer.classList.toggle('white')
  searchBar.classList.toggle('white')
  searchInput.classList.toggle('white')
  selectRegion.classList.toggle('white')

  const text1 = "Light Mode";
  const text2 = "Dark Mode";

  function toggleText() {
    if (btnMode.textContent === text1) {
      btnMode.textContent = text2;
    } else {
      btnMode.textContent = text1;
    }
  }

  toggleText();
})