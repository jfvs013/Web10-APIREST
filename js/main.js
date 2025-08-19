const showMessage = (message, onOk = null) => {
    const modal = document.getElementById('message-modal');
    if (!modal) return;

    document.getElementById('modal-message').textContent = message;

    const okBtn = document.getElementById('modal-ok-btn');
    const closeBtn = document.querySelector('.close-btn');

    const handleClose = () => {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', handleOk);
        closeBtn.removeEventListener('click', handleClose);
        window.removeEventListener('click', handleCloseOutside);
    };

    const handleOk = () => {
        handleClose();
        if (onOk) onOk();
    };

    const handleCloseOutside = (event) => {
        if (event.target === modal) {
            handleClose();
        }
    };

    okBtn.addEventListener('click', handleOk);
    closeBtn.addEventListener('click', handleClose);
    window.addEventListener('click', handleCloseOutside);

    modal.style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://fakestoreapi.com';

    // Página inicial (lista de produtos)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        const productList = document.getElementById('product-list');

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
<a href="product-detail.html?id=${product.id}" class="btn btn-secondary">Detalhes</a>
<button class="btn btn-danger delete-btn" data-id="${product.id}">Excluir</button>
</div>
</div>
`;
                productList.appendChild(card);
            });
        };

        const deleteProduct = async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Falha ao excluir o produto.');
                }
                showMessage('Produto excluído com sucesso!', () => {
                    window.location.reload();
                });
            } catch (error) {
                showMessage('Erro ao excluir o produto.');
                console.error(error);
            }
        };

        productList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;

                showMessage('Tem certeza de que deseja excluir este produto?', () => {
                    deleteProduct(id);
                });
            }
        });

        fetchAndRenderProducts();
    }

    // Página de detalhes
    else if (window.location.pathname.endsWith('product-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            window.location.href = 'index.html';
            return;
        }

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

                document.getElementById('edit-from-detail-btn').href = `manage-product.html?id=${id}`;
                document.getElementById('delete-from-detail-btn').addEventListener('click', () => {
                    showMessage('Tem certeza de que deseja excluir este produto?', () => {
                        deleteProduct(id);
                    });
                });
                document.getElementById('back-to-home-btn').addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                showMessage('Erro ao carregar os detalhes do produto.', () => {
                    window.location.href = 'index.html';
                });
                console.error(error);
            }
        };

        const deleteProduct = async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Falha ao excluir o produto.');
                }
                showMessage('Produto excluído com sucesso!', () => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                showMessage('Erro ao excluir o produto.');
                console.error(error);
            }
        };

        fetchAndRenderProductDetail(productId);
    }

    // Página de gerenciamento (adicionar/editar)
    else if (window.location.pathname.endsWith('manage-product.html')) {
        const productForm = document.getElementById('product-form');
        const formTitle = document.getElementById('form-title');

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            formTitle.textContent = 'Editar Produto';
            fetch(`${API_BASE_URL}/products/${productId}`)
                .then(res => res.json())
                .then(product => {
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.title;
                    document.getElementById('product-price-input').value = product.price;
                    document.getElementById('product-description-input').value = product.description;
                    document.getElementById('product-image-url').value = product.image;
                    document.getElementById('product-category').value = product.category;
                })
                .catch(error => {
                    showMessage('Erro ao carregar produto para edição.', () => {
                        window.location.href = 'index.html';
                    });
                    console.error(error);
                });
        } else {
            formTitle.textContent = 'Adicionar Novo Produto';
        }

        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const method = productId ? 'PUT' : 'POST';
            const url = productId ? `${API_BASE_URL}/products/${productId}` : `${API_BASE_URL}/products`;

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
                showMessage(`Produto ${method === 'POST' ? 'criado' : 'atualizado'} com sucesso!`, () => {
                    window.location.href = 'index.html';
                });
            } catch (error) {
                showMessage('Erro ao salvar o produto.');
                console.error(error);
            }
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
