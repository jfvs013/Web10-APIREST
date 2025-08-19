document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://fakestoreapi.com';


    const homePage = document.getElementById('home-page');
    const productDetailPage = document.getElementById('product-detail-page');
    const manageProductPage = document.getElementById('manage-product-page');
    const productList = document.getElementById('product-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancel-btn');
    const appTitle = document.getElementById('app-title');

    let currentProductId = null;


    const showPage = (pageId, title) => {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        if (title) {
            formTitle.textContent = title;
        }
    };

    const fetchAndRenderProducts = async () => {
        productList.innerHTML = '<p>Carregando produtos...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error('Falha ao buscar produtos.');
            }
            const products = await response.json();
            renderProductList(products);
        } catch (error) {
            productList.innerHTML = `<p style="color: red;">Ocorreu um erro: ${error.message}</p>`;
            console.error(error);
        }
    };

    const renderProductList = (products) => {
        productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <div class="product-card-content">
                    <h3>${product.title}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <div class="product-card-actions">
                        <button class="btn btn-secondary detail-btn" data-id="${product.id}">Detalhes</button>
                        <button class="btn btn-danger delete-btn" data-id="${product.id}">Excluir</button>
                    </div>
                </div>
            `;
            productList.appendChild(card);
        });
    };

    const fetchAndRenderProductDetail = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            if (!response.ok) {
                throw new Error('Produto não encontrado.');
            }
            const product = await response.json();

            document.getElementById('product-image').src = product.image;
            document.getElementById('product-title').textContent = product.title;
            document.getElementById('product-price').textContent = `Preço: $${product.price.toFixed(2)}`;
            document.getElementById('product-description').textContent = product.description;

            currentProductId = product.id;
            showPage('product-detail-page');
        } catch (error) {
            alert('Erro ao carregar os detalhes do produto.');
            console.error(error);
            showPage('home-page');
        }
    };
    const deleteProduct = async (id) => {
        const confirmed = confirm('Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita na API fake.');
        if (confirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Falha ao excluir o produto.');
                }
                alert('Produto excluído com sucesso!');
                fetchAndRenderProducts();
                showPage('home-page');
            } catch (error) {
                alert('Erro ao excluir o produto.');
                console.error(error);
            }
        }
    };


    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;

        const productData = {
            title: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price-input').value),
            description: document.getElementById('product-description-input').value,
            image: document.getElementById('product-image-url').value,
            category: document.getElementById('product-category').value,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Falha na operação.');
            }
            alert(`Produto ${method === 'POST' ? 'criado' : 'atualizado'} com sucesso!`);
            productForm.reset();
            showPage('home-page');
            fetchAndRenderProducts();
        } catch (error) {
            alert('Erro ao salvar o produto.');
            console.error(error);
        }
    });
    appTitle.addEventListener('click', () => showPage('home-page'));
    addProductBtn.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('product-id').value = '';
        showPage('manage-product-page', 'Adicionar Novo Produto');
    });
    cancelBtn.addEventListener('click', () => showPage('home-page'));


    document.addEventListener('click', (e) => {
        if (e.target.matches('.detail-btn')) {
            const id = e.target.dataset.id;
            fetchAndRenderProductDetail(id);
        } else if (e.target.matches('.delete-btn')) {
            const id = e.target.dataset.id;
            deleteProduct(id);
        } else if (e.target.id === 'back-to-home-btn') {
            showPage('home-page');
        } else if (e.target.id === 'edit-from-detail-btn') {

            fetch(`${API_BASE_URL}/products/${currentProductId}`)
                .then(res => res.json())
                .then(product => {
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.title;
                    document.getElementById('product-price-input').value = product.price;
                    document.getElementById('product-description-input').value = product.description;
                    document.getElementById('product-image-url').value = product.image;
                    document.getElementById('product-category').value = product.category;
                    showPage('manage-product-page', 'Editar Produto');
                });
        } else if (e.target.id === 'delete-from-detail-btn') {
            deleteProduct(currentProductId);
        }
    });


    fetchAndRenderProducts();
});