if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
};

function ready() {

    var removeButtons = document.getElementsByClassName('btn btn-danger');
    for (let i = 0; i < removeButtons.length; i++) {
        var clickedButton = removeButtons[i];
        clickedButton.addEventListener('click', removeClickedCartItem);
    };


    var cartQuantitySelectors = document.getElementsByClassName('cart-quantity-input');
    for (let i = 0; i < cartQuantitySelectors.length; i++) {
        cartQuantitySelectors[i].addEventListener('change', function (event) {
            if (event.target.value < 1 || isNaN(event.target.value)) {
                event.target.value = 1;
            };
            updateCartValue();
        });
    };

    var addToCartButtons = document.getElementsByClassName("btn btn-primary shop-item-button");
    for (let i = 0; i < addToCartButtons.length; i++) {
        addToCartButtons[i].addEventListener('click', addToCart);
    }
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token){
        var items = [];
        var cartItemsContainer = document.getElementsByClassName('cart-items')[0];
        var cartRows = cartItemsContainer.getElementsByClassName('cart-row');
        for(var i = 0; i < cartRows.length; i++) {
            var cartRow = cartRows[i];
            var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
            var quantity = quantityElement.value;
            var id = cartRow.dataset.itemId;
            console.log("id: "+id);
            items.push({
                id: id,
                quantity: quantity
            })
        }
        fetch('/purchase',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                'Accept':'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(response){
            return response.json();
        }).then(function(data){
            alert('data.message');
            var cartItems = document.getElementsByClassName("cart-items")[0];
            while(cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild);
            } 
            updateCartValue();
        }).catch(function(error){
            console.error(error);
        })
    }
});

var purchaseButton = document.getElementsByClassName('btn btn-primary btn-purchase')[0];    
purchaseButton.addEventListener('click', function(){
    var priceElement = document.getElementsByClassName('cart-total-price')[0];
    price = parseFloat(priceElement.innerText.replace('$',''))*100;
    console.log("Preis: ");
    console.log(price);
    stripeHandler.open({
        amount: price
    });
});

function removeClickedCartItem(event) {
    event.target.parentElement.parentElement.remove();
    updateCartValue();
};

function addToCart(event) {
    var item = event.target.parentElement.parentElement;
    var title = item.getElementsByClassName("shop-item-title")[0].innerText;
    var price = item.getElementsByClassName("shop-item-price")[0].innerText;
    var imageSrc = item.getElementsByClassName("shop-item-image")[0].src;
    var id = item.dataset.itemId;
    addItemToCart(title, price, imageSrc, id);
};

function addItemToCart(title, price, imageSrc, id) {
    var cartRow = document.createElement('div')
    cartRow.dataset.itemId = id; 
    var cartItems = document.getElementsByClassName('cart-items')[0];
    var cartItemTitles = cartItems.getElementsByClassName('cart-item-title');

    for (let i = 0; i < cartItemTitles.length; i++) {
        if (cartItemTitles[i].innerText === title) {
            var cartItemQuantity = parseInt(cartItemTitles[i].parentElement.parentElement.getElementsByClassName('cart-quantity-input')[0].value);
            cartItemTitles[i].parentElement.parentElement.getElementsByClassName('cart-quantity-input')[0].value = cartItemQuantity + 1;
            updateCartValue();
            ready();
            return;
        }
    }
    cartRow.innerHTML =
        `
    <div class="cart-row" data-item-id="${id}">
                    <div class="cart-item cart-column" data-item-id="${id}">
                        <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
                        <span class="cart-item-title">${title}</span>
                    </div>
                    <span class="cart-price cart-column">${price}</span>
                    <div class="cart-quantity cart-column">
                        <input class="cart-quantity-input" type="number" value="1">
                        <button class="btn btn-danger" type="button">REMOVE</button>
                    </div>
                </div>
    `
    cartItems.append(cartRow);
    updateCartValue();
    ready();
}

function updateCartValue() {
    var cartItems = document.getElementsByClassName('cart-items');
    var cartRows = cartItems[0].getElementsByClassName('cart-row');
    var total = 0;

    for (let i = 0; i < cartRows.length; i++) {
        var priceElement = cartRows[i].getElementsByClassName('cart-price')[0];
        var price = parseFloat(priceElement.innerText.replace("$", ""));
        var quantity = cartRows[i].getElementsByClassName('cart-quantity-input')[0].value;

        total = total + (price * quantity);
    };

    document.getElementsByClassName('cart-total-price')[0].innerText = "$" + Math.round(total * 100) / 100;
}