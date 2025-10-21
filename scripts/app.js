document.getElementById('searchButton').addEventListener('click', fetchCocktail);

function fetchCocktail() {
  const q = document.getElementById('cocktailName').value.trim();
  const $result = document.getElementById('result');

  if (!q) { alert('¡No olvides escribir el nombre de un cóctel!'); return; }

  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`;
  $result.innerHTML = '<h2>Cargando...</h2>';

  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Respuesta HTTP inválida');
      return r.json();
    })
    .then(data => {
      const c = data.drinks ? data.drinks[0] : null;
      if (!c) { $result.innerHTML = `<p>No se encontró: <strong>${q}</strong></p>`; return; }

      $result.innerHTML = `
        <h2>${c.strDrink}</h2>
        <img src="${c.strDrinkThumb}" alt="${c.strDrink}" width="200" height="300">
        <p><strong>Categoría:</strong> ${c.strCategory}</p>
        <p><strong>Instrucciones:</strong> ${c.strInstructions}</p>
        <p><strong>Ingrediente 1:</strong> ${c.strIngredient1 || '-'}</p>
      `;
    })
    .catch(err => {
      $result.innerHTML = `<p style="color:#c00">Error al procesar: ${err.message}</p>`;
    });
}
