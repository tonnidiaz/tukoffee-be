


const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const pstatus = params.get("status")
console.log(pstatus)
let card = "";
switch (pstatus){
    case "success":
        card = "pass"
        console.log("Is a success");
        break;
    case "cancel":
        card = "cancel"
        break;
    case "fail":
        card = "fail"
        break;
    default:
        card = "default"
        break
}
console.log(card)
document.getElementById(card)?.classList.add("show")

if (document.getElementById("paypal"))
{async function createOrder (data, actions){
    console.log("creating order")
    return actions.order.create({
        purchase_units: [
            {
              amount: {
                value: `5`,
                currency_code: "USD",
              },
            },
          ],
    }).then(orderId=> orderId)
    .catch(e=>{
        console.log(e);
    });`12qaz`
}
paypal_sdk.Buttons({
        createOrder
    }).render("#paypal");

 }

 var socket = io('https://tukoffee.vercel.app');
 socket.on('connect', ()=>{
    console.log('CONNECTED')
 })
 socket.on('event', d=>{
    console.log(d)
 })
    const btn = document.getElementById('emit-go-btn')
    btn.onclick = ()=>{
        console.log('EMIT GO')
        console.log(socket.connected)
        socket.emit('go', {data: 'jst go'})
        console.log('EMIT MSG')
        socket.emit('msg', {data: 'jst go'})
    }