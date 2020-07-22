if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const express = require('express');
const app = express();
const fs = require('fs');
const stripe = require('stripe')(stripeSecretKey);

app.set('view-engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

const PORT = 80;

app.get('/store', function(request,response){
    fs.readFile('items.json', function(error, data){
        if(error){
            response.status(500).end();
        } else {
            response.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
                
            })
        }
    })
})

app.post('/purchase', function(request,response){
    fs.readFile('items.json', function(error, data){
        if(error){
            response.status(500).end();
        } else {
            const itemsJson = JSON.parse(data);
            const itemsArray = itemsJson.music.concat(itemsJson.merch);
            let total = 0;
            console.log(request.body);
            request.body.items.forEach(function(item){
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity;
            })

            stripe.charges.create({
                amount: total,
                source: request.body.stripeTokenId,
                currency: 'usd'
            }).then(function(){
                console.log("Charge Successfull");
                response.json({ message: "Successfully purchased Items! "})
            }).catch(function(error){
                console.log("Charge Failed");
                console.log("Error: " + error);
                response.status(500).end();
            })
        }
})

})


app.listen(PORT);
console.log(stripeSecretKey);