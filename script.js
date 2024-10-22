document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // Inicializar las 10 filas de etiquetas
    initializeLabels();

    // Manejar la búsqueda
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchProducts(searchTerm);
        }
    });

    // Función para buscar productos
    async function searchProducts(term) {
        searchResults.innerHTML = '<div class="loading">Buscando productos...</div>';

        try {
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&json=1&page_size=24`);
            const data = await response.json();

            if (data.products && data.products.length > 0) {
                displayProducts(data.products);
            } else {
                searchResults.innerHTML = '<div class="error">No se encontraron productos.</div>';
            }
        } catch (error) {
            console.error('Error:', error);
            searchResults.innerHTML = '<div class="error">Error al buscar productos.</div>';
        }
    }

    // Función para mostrar productos
    function displayProducts(products) {
        const productsList = document.createElement('ul');
        productsList.className = 'products-list';

        products.forEach(product => {
            const li = document.createElement('li');
            li.className = 'product-item';

            const imageUrl = product.image_url || 'placeholder.jpg';
            const productName = product.product_name || 'Nombre no disponible';

            li.innerHTML = `
                <div class="product-link" onclick="selectProduct(${product.id}, '${imageUrl}', '${productName}')">
                    <div class="product-image-container">
                        <img src="${imageUrl}" alt="${productName}" class="product-image">
                    </div>
                    <h3 class="product-name">${productName}</h3>
                </div>
            `;

            productsList.appendChild(li);
        });

        searchResults.innerHTML = '';
        searchResults.appendChild(productsList);
    }

    // Inicializar las etiquetas
    function initializeLabels() {
        const labelsContainer = document.querySelector('.labels-rows');
        let html = '';
        
        for (let i = 1; i <= 10; i++) {
            const number = i.toString().padStart(2, '0');
            html += createLabelRow(number);
        }
        
        labelsContainer.innerHTML = html;

        // Inicializar los códigos QR
        document.querySelectorAll('.qr-input input').forEach((input, index) => {
            input.addEventListener('input', function() {
                updateQRCode(index, this.value);
            });
            // Generar QR inicial
            if (input.value) {
                updateQRCode(index, input.value);
            }
        });
    }

    // Crear una fila de etiqueta
    function createLabelRow(number) {
        return `
            <div class="label-group">
                <div class="qr-input">
                    <span class="number">${number}</span>
                    <input type="text" value="">
                </div>
                <div class="label-row">
                    <div class="product-cell">
                        <img src="" alt="Producto">
                    </div>
                    <div class="name-cell">
                        <span></span>
                    </div>
                    <div class="qr-cell">
                        <img src="" alt="QR Code">
                    </div>
                </div>
            </div>
        `;
    }

    // Actualizar código QR
    function updateQRCode(index, text) {
        if (!text) return;
        
        const qr = qrcode(0, 'L');
        qr.addData(text);
        qr.make();
        
        const qrCells = document.querySelectorAll('.qr-cell img');
        if (qrCells[index]) {
            qrCells[index].src = qr.createDataURL(4);
        }
    }

    // Manejar la selección de producto
    window.selectProduct = function(id, imageUrl, name) {
        const cells = document.querySelectorAll('.label-row');
        if (currentIndex < cells.length) {
            const productCell = cells[currentIndex].querySelector('.product-cell img');
            const nameCell = cells[currentIndex].querySelector('.name-cell span');
            
            productCell.src = imageUrl;
            nameCell.textContent = name;
            
            currentIndex++;
        }
    };

    // Manejar impresión
    document.getElementById('printButton').addEventListener('click', () => {
        window.print();
    });
});

let currentIndex = 0;
