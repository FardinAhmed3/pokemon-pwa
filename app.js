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

const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

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

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
  
  searchInput.focus();
}); 