const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const pokemonInfo = document.getElementById('pokemonInfo');
const pokemonImage = document.getElementById('pokemonImage');
const pokemonName = document.getElementById('pokemonName');
const pokemonTypes = document.getElementById('pokemonTypes');
const pokemonHeight = document.getElementById('pokemonHeight');
const pokemonWeight = document.getElementById('pokemonWeight');
const pokemonExp = document.getElementById('pokemonExp');
const pokemonAbilities = document.getElementById('pokemonAbilities');
const pokemonStats = document.getElementById('pokemonStats');
const typeFilters = document.getElementById('typeFilters');
const pokemonLists = document.getElementById('pokemonLists');

const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

// All pokemon types and their colors
const typeColors = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

// Track active filters
let activeFilters = new Set();
let pokemonsByType = {};
let allPokemon = [];


window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
  
  searchInput.focus();
  
  createTypeFilters();
  
  // Load Pokemon data
  await loadPokemonData();
  
  // Organize Pokemon by type and display them
  organizePokemonByType();
  displayPokemonByType();
});


function createTypeFilters() {
  Object.entries(typeColors).forEach(([type, color]) => {
    const typeFilter = document.createElement('div');
    typeFilter.classList.add('type-filter');
    typeFilter.dataset.type = type;
    typeFilter.textContent = type;
    typeFilter.style.backgroundColor = color;
    
    typeFilter.addEventListener('click', () => toggleTypeFilter(type));
    
    typeFilters.appendChild(typeFilter);
  });
}

// Toggle type filter selection
function toggleTypeFilter(type) {
  const filterElement = document.querySelector(`.type-filter[data-type="${type}"]`);
  
  if (activeFilters.has(type)) {
    activeFilters.delete(type);
    filterElement.classList.remove('active');
  } else {
    activeFilters.add(type);
    filterElement.classList.add('active');
  }
  
  updatePokemonListVisibility();
}

function updatePokemonListVisibility() {
  const typeSections = document.querySelectorAll('.type-section');
  
  if (activeFilters.size === 0) {
    typeSections.forEach(section => {
      section.classList.remove('hidden-section');
    });
  } else {
    typeSections.forEach(section => {
      const sectionType = section.dataset.type;
      if (activeFilters.has(sectionType)) {
        section.classList.remove('hidden-section');
      } else {
        section.classList.add('hidden-section');
      }
    });
  }
}

// Load Pokemon data from the JSON file
async function loadPokemonData() {
  try {
    showLoading();
    const response = await fetch('pokemon.json');
    if (!response.ok) {
      throw new Error('Failed to load Pokemon data');
    }
    allPokemon = await response.json();
    hideLoading();
  } catch (error) {
    hideLoading();
    showError('Failed to load Pokemon data. Please refresh the page.');
    console.error(error);
  }
}

// Organize Pokemon by type
function organizePokemonByType() {
  Object.keys(typeColors).forEach(type => {
    pokemonsByType[type] = [];
  });
  
  allPokemon.forEach(pokemon => {
    const type1 = pokemon["Type 1"].toLowerCase();
    const type2 = pokemon["Type 2"].toLowerCase();
    
    if (type1 && pokemonsByType[type1]) {
      pokemonsByType[type1].push(pokemon);
    }
    
    if (type2 && pokemonsByType[type2]) {
      pokemonsByType[type2].push(pokemon);
    }
  });
}

function displayPokemonByType() {
  pokemonLists.innerHTML = '';
  
  Object.entries(pokemonsByType).forEach(([type, pokemons]) => {
    if (pokemons.length === 0) return;
    
    const typeSection = document.createElement('div');
    typeSection.classList.add('type-section', 'bg-white', 'p-4', 'rounded-lg', 'shadow');
    typeSection.dataset.type = type;
    
    // Create type header
    const typeHeader = document.createElement('div');
    typeHeader.classList.add('mb-4', 'pb-2', 'border-b', 'border-gray-200');
    
    const typeTitle = document.createElement('h3');
    typeTitle.classList.add('text-lg', 'font-bold', 'capitalize', 'flex', 'items-center');
    
    const typeBadge = document.createElement('span');
    typeBadge.classList.add('type-badge', 'mr-2');
    typeBadge.textContent = type;
    typeBadge.style.backgroundColor = typeColors[type];
    
    typeTitle.appendChild(typeBadge);
    typeTitle.appendChild(document.createTextNode(`${type} (${pokemons.length})`));
    typeHeader.appendChild(typeTitle);
    typeSection.appendChild(typeHeader);
    

    const pokemonContainer = document.createElement('div');
    pokemonContainer.classList.add('pokemon-container', 'max-h-64', 'overflow-y-auto', 'pr-2');
    
    pokemons.forEach(pokemon => {
      const pokemonItem = document.createElement('div');
      pokemonItem.classList.add('pokemon-item', 'flex', 'items-center', 'mb-2', 'bg-gray-50', 'rounded');
      pokemonItem.dataset.name = pokemon.Name.toLowerCase();
      

      pokemonItem.addEventListener('click', () => {
        searchInput.value = pokemon.Name.toLowerCase();
        searchPokemon();
      });
      
      const nameElement = document.createElement('span');
      nameElement.classList.add('capitalize', 'ml-2', 'flex-grow');
      nameElement.textContent = pokemon.Name;
      
      pokemonItem.appendChild(nameElement);
      

      if (pokemon.Form) {
        const formElement = document.createElement('span');
        formElement.classList.add('text-xs', 'text-gray-500', 'italic', 'ml-2');
        formElement.textContent = pokemon.Form;
        pokemonItem.appendChild(formElement);
      }
      
      const typeWrapper = document.createElement('div');
      typeWrapper.classList.add('flex', 'ml-auto', 'mr-2', 'space-x-1');
      
      const type1Badge = document.createElement('span');
      type1Badge.classList.add('type-badge');
      type1Badge.textContent = pokemon["Type 1"].toLowerCase();
      type1Badge.style.backgroundColor = typeColors[pokemon["Type 1"].toLowerCase()];
      typeWrapper.appendChild(type1Badge);
      
      if (pokemon["Type 2"]) {
        const type2Badge = document.createElement('span');
        type2Badge.classList.add('type-badge');
        type2Badge.textContent = pokemon["Type 2"].toLowerCase();
        type2Badge.style.backgroundColor = typeColors[pokemon["Type 2"].toLowerCase()];
        typeWrapper.appendChild(type2Badge);
      }
      
      pokemonItem.appendChild(typeWrapper);
      pokemonContainer.appendChild(pokemonItem);
    });
    
    typeSection.appendChild(pokemonContainer);
    pokemonLists.appendChild(typeSection);
  });
}

searchButton.addEventListener('click', searchPokemon);
searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    searchPokemon();
  }
});

function showLoading() {
  loadingIndicator.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  pokemonInfo.classList.add('hidden');
}

function hideLoading() {
  loadingIndicator.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  pokemonInfo.classList.add('hidden');
}

function showPokemonInfo() {
  pokemonInfo.classList.remove('hidden');
  pokemonInfo.classList.add('pokemon-appear');
  setTimeout(() => {
    pokemonInfo.classList.remove('pokemon-appear');
  }, 500);
}

async function searchPokemon() {
  const pokemonNameOrId = searchInput.value.trim().toLowerCase();
  
  if (!pokemonNameOrId) {
    showError('Please enter a Pokemon name or ID');
    return;
  }
  
  showLoading();
  
  try {
    const data = await fetchPokemonData(pokemonNameOrId);
    displayPokemonData(data);
    hideLoading();
    showPokemonInfo();
    
    if ('caches' in window) {
      cacheData(pokemonNameOrId, data);
    }
  } catch (error) {
    hideLoading();
    showError('Pokemon not found. Check the spelling or try another Pokemon.');
  }
}

async function fetchPokemonData(nameOrId) {
  try {
    if ('caches' in window) {
      const cachedData = await getCachedData(nameOrId);
      if (cachedData) return cachedData;
    }
    
    const response = await fetch(`${API_BASE_URL}${nameOrId}`);
    
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function getCachedData(nameOrId) {
  try {
    const cache = await caches.open('pokemon-data');
    const cachedResponse = await cache.match(`${API_BASE_URL}${nameOrId}`);
    
    if (cachedResponse) {
      return await cachedResponse.json();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function cacheData(nameOrId, data) {
  try {
    const cache = await caches.open('pokemon-data');
    const response = new Response(JSON.stringify(data));
    await cache.put(`${API_BASE_URL}${nameOrId}`, response);
  } catch (error) {
    console.error('Caching error:', error);
  }
}

function displayPokemonData(pokemon) {
  pokemonName.textContent = pokemon.name;
  
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                  pokemon.sprites.front_default;
  pokemonImage.src = imageUrl;
  pokemonImage.alt = pokemon.name;
  
  displayTypes(pokemon.types);
  
  pokemonHeight.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  pokemonWeight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
  pokemonExp.textContent = pokemon.base_experience || 'N/A';
  
  displayAbilities(pokemon.abilities);
  displayStats(pokemon.stats);
}

function displayTypes(types) {
  pokemonTypes.innerHTML = '';
  
  types.forEach(typeInfo => {
    const typeName = typeInfo.type.name;
    const typeColor = typeColors[typeName] || '#777';
    
    const typeElement = document.createElement('span');
    typeElement.textContent = typeName;
    typeElement.className = 'type-badge';
    typeElement.style.backgroundColor = typeColor;
    
    pokemonTypes.appendChild(typeElement);
  });
}

function displayAbilities(abilities) {
  pokemonAbilities.innerHTML = '';
  
  abilities.forEach(abilityInfo => {
    const abilityName = abilityInfo.ability.name.replace('-', ' ');
    
    const abilityElement = document.createElement('div');
    abilityElement.textContent = abilityName;
    abilityElement.className = 'capitalize';
    
    pokemonAbilities.appendChild(abilityElement);
  });
}

function displayStats(stats) {
  pokemonStats.innerHTML = '';
  
  stats.forEach(stat => {
    const statName = stat.stat.name.replace('-', ' ');
    const statValue = stat.base_stat;
    const statPercentage = Math.min(100, Math.max(0, (statValue / 255) * 100));
    
    const statContainer = document.createElement('div');
    
    const statHeader = document.createElement('div');
    statHeader.className = 'flex justify-between mb-1';
    
    const nameElement = document.createElement('span');
    nameElement.textContent = statName;
    nameElement.className = 'text-sm capitalize';
    
    const valueElement = document.createElement('span');
    valueElement.textContent = statValue;
    valueElement.className = 'text-sm font-medium';
    
    statHeader.appendChild(nameElement);
    statHeader.appendChild(valueElement);
    
    const barContainer = document.createElement('div');
    barContainer.className = 'stat-bar bg-gray-200';
    
    const barFill = document.createElement('div');
    barFill.className = 'stat-fill bg-red-500';
    barFill.style.width = '0%';
    
    setTimeout(() => {
      barFill.style.width = `${statPercentage}%`;
    }, 100);
    
    barContainer.appendChild(barFill);
    
    statContainer.appendChild(statHeader);
    statContainer.appendChild(barContainer);
    
    pokemonStats.appendChild(statContainer);
  });
} 