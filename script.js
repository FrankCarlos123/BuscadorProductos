let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const printButton = document.getElementById('printButton');
    const labelsContainer = document.getElementById('labelsContainer');
    const codeInputs = document.querySelectorAll('.code-input');

    // Crear 10 filas de etiquetas
    for(let i = 0; i < 10; i++) {
        createLabelRow(i);
    }

    searchButton.addEventListener('click', buscarProductos);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') buscarProductos();
    });
    printButton.addEventListener('click', () => window.print());

    codeInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            updateQRCode(index, input.value);
        });
        updateQRCode(index, input.value);
    });
});

function createLabelRow(index) {
    const row = document.createElement('div');
    row.className = 'label-row';
    row.innerHTML = `
        <div class="product-cell">
            <img alt="Producto ${index + 1}">
        </div>
        <div class="name-cell">
            <input type="text" placeholder="Nombre del producto">
        </div>
        <div class="qr-cell">
            <img alt="QR Code ${index + 1}">
        </div>
    `;
    labelsContainer.appendChild(row);
}

function updateQRCode(index, text) {
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    const qrImage = document.querySelectorAll('.qr-cell img')[index];
    qrImage.src = qr.createDataURL(4);
}

async function buscarProductos() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const query = searchInput.value.trim();

    if (!query) return;

    resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';

    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=24`);
        const data = await response.json();

        if (!data.products?.length) {
            resultsContainer.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        resultsContainer.innerHTML = data.products.map(product => `
            <div class="product-card" onclick="seleccionarProducto('${product.image_url || ''}', '${product.product_name?.replace(/'/g, "\\'") || ''}')">
                <img src="${product.image_url || ''}" alt="${product.product_name || ''}" onerror="this.src='placeholder.jpg'">
                <h3>${product.product_name || 'Nombre no disponible'}</h3>
            </div>
        `).join('');
    } catch (error) {
        resultsContainer.innerHTML = '<p>Error al buscar productos.</p>';
        console.error(error);
    }
}

function seleccionarProducto(imageUrl, name) {
    if (!imageUrl) return;

    const productCells = document.querySelectorAll('.product-cell img');
    const nameCells = document.querySelectorAll('.name-cell input');
    
    if (currentIndex >= productCells.length) {
        currentIndex = 0;
    }

    productCells[currentIndex].src = imageUrl;
    nameCells[currentIndex].value = name;
    
    currentIndex++;
}